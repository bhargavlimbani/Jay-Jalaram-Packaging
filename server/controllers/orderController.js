const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Invoice = require("../models/Invoice");
const { createInvoiceForOrder } = require("./invoiceController");

const parseOrderItems = (order) => {
  try {
    const parsed = order.items ? JSON.parse(order.items) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const serializeOrder = (order) => {
  const plainOrder = order.toJSON ? order.toJSON() : { ...order };
  plainOrder.items = parseOrderItems(order);
  return plainOrder;
};

const parseChatMessages = (order) => {
  try {
    const parsed = order.chat_messages ? JSON.parse(order.chat_messages) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const appendChatMessage = async (order, sender, message) => {
  const messages = parseChatMessages(order);
  messages.push({
    sender,
    message,
    createdAt: new Date().toISOString(),
  });
  order.chat_messages = JSON.stringify(messages);
  return messages;
};

// Place Order (Customer)
exports.placeOrder = async (req, res) => {
  try {
    const {
      product_id,
      quantity,
      items,
      order_type,
      customer_name,
      customer_phone,
      box_length,
      box_width,
      box_height,
      custom_design,
      design_file_name,
      design_file_data,
      note,
      total_price: custom_total_price,
    } = req.body;

    if (order_type === "custom") {
      const parsedQuantity = Number(quantity);
      const parsedTotalPrice = Number(custom_total_price || 0);

      if (!customer_name || !customer_phone || !box_length || !box_width || !box_height || !quantity) {
        return res.status(400).json({
          message: "Please fill all custom box details",
        });
      }

      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }

      const order = await Order.create({
        user_id: req.user.id,
        quantity: parsedQuantity,
        total_price: parsedTotalPrice,
        order_type: "custom",
        customer_name,
        customer_phone,
        box_length,
        box_width,
        box_height,
        custom_design,
        design_file_name,
        design_file_data,
        note,
        chat_messages: JSON.stringify([]),
        status: "Pending",
      });

      const createdOrder = await Order.findByPk(order.id, {
        include: [Product],
      });

      return res.status(201).json(serializeOrder(createdOrder));
    }

    const requestedItems = Array.isArray(items) && items.length > 0
      ? items
      : [{ product_id, quantity }];

    if (!requestedItems.length) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    const normalizedItems = [];
    let totalQuantity = 0;
    let total_price = 0;

    for (const item of requestedItems) {
      const currentProductId = Number(item?.product_id);
      const parsedQuantity = Number(item?.quantity);

      if (!Number.isInteger(currentProductId) || currentProductId <= 0) {
        return res.status(400).json({ message: "Each cart item must include a valid product" });
      }

      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ message: "Each cart item must include a valid quantity" });
      }

      const product = await Product.findByPk(currentProductId);

      if (!product) {
        return res.status(404).json({ message: "One of the selected products was not found" });
      }

      if (product.name === "Custom Size Box" || product.name === "Custom Design Box") {
        return res.status(400).json({
          message: "Please use the custom box order form for custom box products",
        });
      }

      if (Number(product.stock) < parsedQuantity) {
        return res.status(400).json({
          message: `Only ${product.stock} items left in stock for ${product.name}`,
        });
      }

      const itemTotal = Number(product.price) * parsedQuantity;
      totalQuantity += parsedQuantity;
      total_price += itemTotal;
      normalizedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: Number(product.price),
        quantity: parsedQuantity,
        total_price: Number(itemTotal.toFixed(2)),
      });
    }

    const order = await Order.create({
      user_id: req.user.id,
      product_id: normalizedItems.length === 1 ? normalizedItems[0].product_id : null,
      quantity: totalQuantity,
      total_price: Number(total_price.toFixed(2)),
      items: JSON.stringify(normalizedItems),
      order_type: "product",
      chat_messages: JSON.stringify([]),
      status: "Pending",
    });

    const createdOrder = await Order.findByPk(order.id, {
      include: [Product],
    });

    return res.status(201).json(serializeOrder(createdOrder));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customer: View My Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [Product, Invoice],
      order: [["createdAt", "DESC"]],
    });

    res.json(orders.map(serializeOrder));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customer: Cancel own pending order
exports.cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    await order.destroy();

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customer: Reply to admin comment
exports.replyToOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { customer_reply } = req.body;

    if (!customer_reply || !customer_reply.trim()) {
      return res.status(400).json({ message: "Reply is required" });
    }

    order.customer_reply = customer_reply.trim();
    appendChatMessage(order, "customer", customer_reply.trim());
    await order.save();

    res.json({
      message: "Reply sent successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Send comment to customer
exports.sendAdminComment = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { admin_comment } = req.body;

    if (!admin_comment || !admin_comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    order.admin_comment = admin_comment.trim();
    appendChatMessage(order, "admin", admin_comment.trim());
    await order.save();

    res.json({
      message: "Comment sent successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderChat = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role !== "admin" && order.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      orderId: order.id,
      messages: parseChatMessages(order),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendOrderChatMessage = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role !== "admin" && order.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const sender = req.user.role === "admin" ? "admin" : "customer";
    appendChatMessage(order, sender, message.trim());

    if (sender === "admin") {
      order.admin_comment = message.trim();
    } else {
      order.customer_reply = message.trim();
    }

    await order.save();

    res.json({
      message: "Chat message sent successfully",
      messages: parseChatMessages(order),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: View All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [User, Product, Invoice],
      order: [["createdAt", "DESC"]],
    });

    res.json(orders.map(serializeOrder));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_comment } = req.body;

    const order = await Order.findByPk(id, {
      include: Product,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status === "Accepted" && order.status !== "Accepted" && order.order_type === "product") {
      const orderItems = parseOrderItems(order);

      if (orderItems.length > 0) {
        for (const item of orderItems) {
          const product = await Product.findByPk(item.product_id);

          if (!product) {
            return res.status(404).json({
              message: `Product not found for order item ${item.product_name || item.product_id}`,
            });
          }

          if (Number(product.stock) < Number(item.quantity)) {
            return res.status(400).json({
              message: `Insufficient stock to accept ${product.name}`,
            });
          }
        }

        for (const item of orderItems) {
          const product = await Product.findByPk(item.product_id);
          product.stock -= Number(item.quantity);
          await product.save();
        }
      } else if (order.Product) {
        if (order.Product.stock < order.quantity) {
          return res.status(400).json({
            message: "Insufficient stock to accept this order",
          });
        }

        order.Product.stock -= order.quantity;
        await order.Product.save();
      } else {
        return res.status(400).json({
          message: "This order has no valid product items to accept",
        });
      }
    }

    order.status = status;
    if (typeof admin_comment === "string") {
      order.admin_comment = admin_comment.trim();
      if (admin_comment.trim()) {
        appendChatMessage(order, "admin", admin_comment.trim());
      }
    }
    await order.save();

    res.json({
      message: "Order status updated successfully",
      order: serializeOrder(order),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
