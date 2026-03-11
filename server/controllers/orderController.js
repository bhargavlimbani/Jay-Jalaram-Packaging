const Order = require("../models/Order");
const Product = require("../models/Product");

// Place Order (Customer)
exports.placeOrder = async (req, res) => {
  try {

    // --------- Existing Product Order Logic ---------
    const { product_id, quantity } = req.body;

    if (product_id) {

      const product = await Product.findByPk(product_id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

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

      return res.status(201).json(order);
    }

    // --------- Added Custom Box Order Logic ---------

    const customOrder = await Order.create({
      userId: req.user.id,
      name: req.body.name,
      phone: req.body.phone,
      length: req.body.length,
      width: req.body.width,
      height: req.body.height,
      quantity: req.body.quantity,
      note: req.body.note,
      status: "pending"
    });

    res.json(customOrder);

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