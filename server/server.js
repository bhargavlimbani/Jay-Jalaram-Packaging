const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./models/Product");
require("./models/Order");
require("./models/Invoice");
require("./models/PendingRegistration");
require("./models/Material");
require("./models/User");
require("./models/Payment");
const Product = require("./models/Product");
const Material = require("./models/Material");


const sequelize = require("./config/db");


const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Jai Jalaram Packaging API Running 🚀");
});

const shouldAlter = process.env.DB_SYNC_ALTER === "true";
const syncOptions = shouldAlter ? { alter: true } : undefined;
const dbName = process.env.DB_NAME || "jai_jalaram";

const extractTableFromSql = (sql) => {
  if (!sql) return null;
  const match = sql.match(/SHOW INDEX FROM `([^`]+)`/i);
  return match ? match[1] : null;
};

const syncDatabase = async () => {
  if (shouldAlter) {
    try {
      await sequelize.sync(syncOptions);
      return;
    } catch (error) {
      console.log("Alter sync failed, retrying without alter:", error.message);
    }
  }

  const queryInterface = sequelize.getQueryInterface();
  const maxAttempts = 6;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      await sequelize.sync();
      return;
    } catch (error) {
      const errno = error?.parent?.errno || error?.original?.errno;
      const sqlState = error?.parent?.sqlState || error?.original?.sqlState;
      const sql = error?.parent?.sql || error?.original?.sql || "";
      const tableFromSql = extractTableFromSql(sql);
      const isEngineMissing =
        errno === 1932 || (sqlState === "42S02" && tableFromSql);

      if (isEngineMissing && tableFromSql) {
        console.log(
          `${tableFromSql} table metadata is corrupted/missing in engine. Recreating ${tableFromSql} table...`
        );
        await queryInterface.dropTable(tableFromSql);
        attempt += 1;
        continue;
      }
      throw error;
    }
  }
  throw new Error("Database sync failed after repairing tables.");
};

syncDatabase().then(async () => {
  try {
    const [columns] = await sequelize.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Products' AND COLUMN_NAME = 'box_type'",
      { replacements: [dbName] }
    );

    if (!Array.isArray(columns) || columns.length === 0) {
      await sequelize.query(
        "ALTER TABLE `Products` ADD COLUMN `box_type` ENUM('carton-box','corrugated-box','printed-corrugated-box','duplex-box') NOT NULL DEFAULT 'corrugated-box'"
      );
    }
  } catch (error) {
    console.log("Unable to ensure Products.box_type column:", error.message);
  }

  await Product.findOrCreate({
    where: { name: "Custom Size Box" },
    defaults: {
      box_type: "corrugated-box",
      description: "Box made as per customer size requirement",
      price: 50,
      stock: 100,
    },
  });

  await Product.findOrCreate({
    where: { name: "Custom Design Box" },
    defaults: {
      box_type: "printed-corrugated-box",
      description: "Printed and designed box for brand packaging",
      price: 80,
      stock: 100,
    },
  });

  await Material.findOrCreate({
    where: { name: "Kraft Paper" },
    defaults: { unit: "kg", quantity: 0, unit_price: 0 },
  });

  await Material.findOrCreate({
    where: { name: "Duplex Board" },
    defaults: { unit: "kg", quantity: 0, unit_price: 0 },
  });

  await Material.findOrCreate({
    where: { name: "Gum" },
    defaults: { unit: "kg", quantity: 0, unit_price: 0 },
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
