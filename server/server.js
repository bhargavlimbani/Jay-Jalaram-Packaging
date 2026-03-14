const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./models/Product");
require("./models/Order");
require("./models/Invoice");
require("./models/Material");
const Product = require("./models/Product");


const sequelize = require("./config/db");


const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Jai Jalaram Packaging API Running 🚀");
});

sequelize.sync({ alter: true }).then(async () => {
  await Product.findOrCreate({
    where: { name: "Custom Size Box" },
    defaults: {
      description: "Box made as per customer size requirement",
      price: 50,
      stock: 100,
    },
  });

  await Product.findOrCreate({
    where: { name: "Custom Design Box" },
    defaults: {
      description: "Printed and designed box for brand packaging",
      price: 80,
      stock: 100,
    },
  });
});

const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);
const invoiceRoutes = require("./routes/invoiceRoutes");
app.use("/api/invoices", invoiceRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);
const materialRoutes = require("./routes/materialRoutes");
app.use("/api/materials", materialRoutes);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const verifyToken = require("./middleware/authMiddleware");

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully 🔐",
    user: req.user,
  });
});
const checkRole = require("./middleware/roleMiddleware");

app.get(
  "/api/admin",
  verifyToken,
  checkRole("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin 👑" });
  }
);
