const Invoice = require("../models/Invoice");
const Order = require("../models/Order");

exports.generateInvoice = async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const gstRate = 0.18;
    const gstAmount = order.total_price * gstRate;
    const totalWithGST = parseFloat(order.total_price) + gstAmount;

    const invoice = await Invoice.create({
      order_id,
      invoice_number: "INV-" + Date.now(),
      gst_amount: gstAmount,
      total_with_gst: totalWithGST,
    });

    res.status(201).json(invoice);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};