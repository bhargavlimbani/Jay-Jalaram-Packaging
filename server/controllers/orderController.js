const Order = require("../models/Order");
const Product = require("../models/Product");

// Place Order (Customer)
exports.placeOrder = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    const product = await Product.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const total_price = product.price * quantity;

    const order = await Order.create({
      user_id: req.user.id,
      product_id,
      quantity,
      total_price,
    });

    // Reduce stock
    // product.stock -= quantity;
    // await product.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customer: View My Orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: Product,
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: View All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [Product],
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id, {
      include: Product,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If accepting order → check & reduce stock
    if (status === "Accepted") {
      if (order.Product.stock < order.quantity) {
        return res.status(400).json({
          message: "Insufficient stock to accept this order",
        });
      }

      order.Product.stock -= order.quantity;
      await order.Product.save();
    }

    order.status = status;
    await order.save();

    res.json({
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};