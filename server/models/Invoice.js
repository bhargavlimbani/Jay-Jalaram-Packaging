const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Order = require("./Order");

const Invoice = sequelize.define("Invoice", {
  invoice_number: {
    type: DataTypes.STRING,
    unique: true,
  },
  gst_amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  total_with_gst: {
    type: DataTypes.DECIMAL(10, 2),
  },
});

Order.hasOne(Invoice, { foreignKey: "order_id" });
Invoice.belongsTo(Order, { foreignKey: "order_id" });

module.exports = Invoice;