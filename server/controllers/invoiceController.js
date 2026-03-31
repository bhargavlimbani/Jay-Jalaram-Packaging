const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const sendInvoiceEmail = require("../utils/sendInvoiceEmail");

const COMPANY_INFO = {
  name: "Jai Jalaram Packaging",
  address: [
    "SR NO 64 PLOT NO 15,",
    "SAFAR INDUSTRIAL ZONE,",
    "Near Larson Plast,",
    "Shapar Veraval, Rajkot, Gujarat - 360024",
  ].join("\n"),
  gstNumber: "24AAIFJ2023L1ZJ",
  phones: ["9429315940", "6355990290", "9909309111"],
};

const COMPANY_LOGO_PATH = path.join(__dirname, "../../client/src/assets/logo.png");

const parseOrderItems = (order) => {
  try {
    const parsed = order.items ? JSON.parse(order.items) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const parseInvoiceItems = (invoice) => {
  try {
    const parsed = invoice.items_summary ? JSON.parse(invoice.items_summary) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const serializeInvoice = (invoice) => {
  const plainInvoice = invoice.toJSON ? invoice.toJSON() : { ...invoice };
  plainInvoice.items_summary = parseInvoiceItems(invoice);
  return plainInvoice;
};

const buildBoxDimensions = (order) => {
  if (order.box_length && order.box_width && order.box_height) {
    return `${order.box_length} x ${order.box_width} x ${order.box_height}`;
  }

  return "Standard Product Order";
};

const buildInvoiceItems = (order) => {
  if (order.order_type === "custom") {
    const total = Number(order.total_price || 0);
    const quantity = Number(order.quantity || 0);
    return [
      {
        description: `Custom Box (${buildBoxDimensions(order)})`,
        quantity,
        price: quantity > 0 ? Number((total / quantity).toFixed(2)) : total,
        total_amount: total,
      },
    ];
  }

  const orderItems = parseOrderItems(order);

  if (orderItems.length > 0) {
    return orderItems.map((item) => ({
      description: item.product_name || "Product",
      quantity: Number(item.quantity || 0),
      price: Number(item.product_price || 0),
      total_amount: Number(item.total_price || 0),
    }));
  }

  return [
    {
      description: order.Product?.name || "Product",
      quantity: Number(order.quantity || 0),
      price: Number(order.Product?.price || 0),
      total_amount: Number(order.total_price || 0),
    },
  ];
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const randomPart = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `INV-${datePart}-${randomPart}`;
};

const getInvoiceWithAssociations = async (where) => {
  return Invoice.findOne({
    where,
    include: [
      {
        model: Order,
        include: [Product, User],
      },
      User,
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getInvoiceByIdWithAssociations = async (id) => {
  return Invoice.findByPk(id, {
    include: [
      {
        model: Order,
        include: [Product, User],
      },
      User,
    ],
  });
};

const buildInvoicePdfBuffer = (invoice) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const items = parseInvoiceItems(invoice);
    const invoiceDate = new Date(invoice.invoice_date || invoice.createdAt);
    const hasCompanyLogo = fs.existsSync(COMPANY_LOGO_PATH);

    // --- Professional Header ---
    const headerTop = 40;
    const logoSize = 60;
    let rightColX = 340;
    let leftColX = hasCompanyLogo ? 120 : 50;
    if (hasCompanyLogo) {
      doc.image(COMPANY_LOGO_PATH, 50, headerTop, {
        fit: [logoSize, logoSize],
        align: "left",
        valign: "center",
      });
    }

    // Company Name
    doc
      .fontSize(18)
      .fillColor("#1f2937")
      .text(invoice.company_name || COMPANY_INFO.name, leftColX, headerTop, { width: 300, continued: false });

    // Company Address, GST, Phone
    let companyInfoY = headerTop + 22;
    doc
      .fontSize(9)
      .fillColor("#4b5563")
      .text(invoice.company_address || COMPANY_INFO.address, leftColX, companyInfoY, { width: 300 })
      .text(`GST No: ${invoice.gst_number || COMPANY_INFO.gstNumber}`, leftColX, companyInfoY + 36)
      .text(`Phone: ${invoice.company_phones || COMPANY_INFO.phones.join(", ")}`, leftColX, companyInfoY + 48);

    // Invoice Info (right aligned)
    doc
      .fontSize(16)
      .fillColor("#111827")
      .text("INVOICE", rightColX, headerTop, { align: "left", width: 200 })
      .fontSize(10)
      .text(`Invoice No: ${invoice.invoice_number}`, rightColX, headerTop + 22, { width: 200 })
      .text(`Order ID: ${invoice.order_id}`, rightColX, headerTop + 36, { width: 200 })
      .text(`Date: ${invoiceDate.toLocaleDateString("en-IN")}`, rightColX, headerTop + 50, { width: 200 });

    // Divider
    doc
      .moveTo(50, headerTop + 80)
      .lineTo(545, headerTop + 80)
      .strokeColor("#d1d5db")
      .stroke();

    // --- Bill To Section ---
    const billToTop = headerTop + 90;
    doc
      .fontSize(11)
      .fillColor("#111827")
      .text("Bill To", 50, billToTop)
      .fontSize(9)
      .fillColor("#4b5563")
      .text(`Name: ${invoice.customer_name}`, 50, billToTop + 18)
      .text(`Phone: ${invoice.customer_phone || "-"}`, 50, billToTop + 32)
      .text(`Address: ${invoice.customer_address || "-"}`, 50, billToTop + 46, { width: 220 });

    doc
      .fontSize(9)
      .fillColor("#111827")
      .text("Box Dimensions", 320, billToTop + 18)
      .fillColor("#4b5563")
      .text(invoice.box_dimensions || "-", 320, billToTop + 32, { width: 220 });

    // --- Table Section ---
    const tableTop = billToTop + 70;
    doc
      .rect(50, tableTop, 495, 24)
      .fill("#ffdb58")
      .fillColor("#111827")
      .fontSize(10)
      .text("Description", 58, tableTop + 7, { width: 220 })
      .text("Qty", 310, tableTop + 7, { width: 40, align: "right" })
      .text("Price", 370, tableTop + 7, { width: 70, align: "right" })
      .text("Total", 460, tableTop + 7, { width: 70, align: "right" });

    let currentY = tableTop + 34;

    items.forEach((item) => {
      doc
        .fillColor("#111827")
        .fontSize(10)
        .text(item.description || "-", 58, currentY, { width: 220 })
        .text(String(item.quantity || 0), 310, currentY, { width: 40, align: "right" })
        .text(`Rs. ${Number(item.price || 0).toFixed(2)}`, 370, currentY, { width: 70, align: "right" })
        .text(`Rs. ${Number(item.total_amount || 0).toFixed(2)}`, 460, currentY, { width: 70, align: "right" });
      currentY += 24;
    });

    doc
      .moveTo(50, currentY + 8)
      .lineTo(545, currentY + 8)
      .strokeColor("#d1d5db")
      .stroke();

    // --- Bill Rubrik (GST Breakdown) ---
    const subtotal = items.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
    const gstRate = 0.18; // 18% GST
    const gstAmount = subtotal * gstRate;
    const grandTotal = subtotal + gstAmount;

    doc
      .fontSize(11)
      .fillColor("#111827")
      .text(`Total Quantity: ${invoice.quantity}`, 50, currentY + 18)
      .fontSize(10)
      .text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 340, currentY + 10, { width: 200, align: "right" })
      .text(`GST (18%): Rs. ${gstAmount.toFixed(2)}`, 340, currentY + 26, { width: 200, align: "right" })
      .text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 340, currentY + 42, { width: 200, align: "right" });

    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text("This invoice is auto-generated when the order is accepted by Jai Jalaram Packaging.", 50, currentY + 70, {
        width: 495,
      });

    doc.end();
  });

const createInvoiceForOrder = async (orderId) => {
  const existingInvoice = await getInvoiceWithAssociations({ order_id: orderId });

  if (existingInvoice) {
    return existingInvoice;
  }

  const order = await Order.findByPk(orderId, {
    include: [Product, User],
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "Completed") {
    throw new Error("Invoice can only be generated for completed orders");
  }

  const invoiceItems = buildInvoiceItems(order);
  const totalAmount = Number(order.total_price || 0);
  const totalQuantity = Number(order.quantity || 0);
  const price = totalQuantity > 0 ? Number((totalAmount / totalQuantity).toFixed(2)) : totalAmount;

  const invoice = await Invoice.create({
    order_id: order.id,
    user_id: order.user_id,
    invoice_number: generateInvoiceNumber(),
    invoice_date: new Date(),
    company_name: COMPANY_INFO.name,
    company_address: COMPANY_INFO.address,
    gst_number: COMPANY_INFO.gstNumber,
    company_phones: COMPANY_INFO.phones.join(", "),
    customer_name: order.customer_name || order.User?.name || "Customer",
    customer_phone: order.customer_phone || order.User?.phone || "",
    customer_address: order.User?.address || "",
    box_dimensions: buildBoxDimensions(order),
    quantity: totalQuantity,
    price,
    total_amount: totalAmount,
    is_shared_with_customer: false,
    shared_at: null,
    items_summary: JSON.stringify(invoiceItems),
  });

  return getInvoiceByIdWithAssociations(invoice.id);
};

exports.generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.body.order_id;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const invoice = await createInvoiceForOrder(orderId);
    res.status(201).json(serializeInvoice(invoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: {
        user_id: req.user.id,
        is_shared_with_customer: true,
      },
      include: [
        {
          model: Order,
          include: [Product],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(invoices.map(serializeInvoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        {
          model: Order,
          include: [Product, User],
        },
        User,
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(invoices.map(serializeInvoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await getInvoiceByIdWithAssociations(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (req.user.role !== "admin" && invoice.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(serializeInvoice(invoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadInvoicePdf = async (req, res) => {
  try {
    const invoice = await getInvoiceByIdWithAssociations(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (
      req.user.role !== "admin" &&
      (invoice.user_id !== req.user.id || !invoice.is_shared_with_customer)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const pdfBuffer = await buildInvoicePdfBuffer(invoice);
    const shouldDownload = req.query.download === "1";
    const fileName = `${invoice.invoice_number}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${shouldDownload ? "attachment" : "inline"}; filename="${fileName}"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.shareInvoiceToCustomer = async (req, res) => {
  try {
    const invoice = await getInvoiceByIdWithAssociations(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const customerEmail =
      invoice.User?.email || invoice.Order?.User?.email || invoice.customer_email;
    if (!customerEmail) {
      return res.status(400).json({
        message: "Customer email is missing. Please update the customer email.",
      });
    }

    invoice.is_shared_with_customer = true;
    invoice.shared_at = new Date();
    await invoice.save();

    let emailMessage = "Invoice shared with customer successfully";
    try {
      const pdfBuffer = await buildInvoicePdfBuffer(invoice);
      await sendInvoiceEmail({
        to: customerEmail,
        customerName: invoice.customer_name || invoice.User?.name,
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date || invoice.createdAt,
        totalAmount: invoice.total_amount,
        pdfBuffer,
        pdfFileName: `${invoice.invoice_number || "invoice"}.pdf`,
        items: parseInvoiceItems(invoice),
      });
    } catch (error) {
      console.log("Failed to send invoice email:", error.message);
      emailMessage =
        "Invoice shared, but email could not be sent. Please check email settings.";
    }

    res.json({
      message: emailMessage,
      invoice: serializeInvoice(invoice),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createInvoiceForOrder = createInvoiceForOrder;
module.exports.serializeInvoice = serializeInvoice;
