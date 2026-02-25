const Product = require("../models/Product");

// Create Product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Products (Public)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Low Stock Products (Admin Dashboard)
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [require("sequelize").Op.lt]: 10, // less than 10
        },
      },
    });

    res.json(lowStockProducts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};