const Product = require("../models/Product");

// Create Product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, image_data, price, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      image_data,
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

// Update Product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_data, price, stock } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.update({
      name,
      description,
      image_data,
      price,
      stock,
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    res.json({ message: "Product deleted successfully" });
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
