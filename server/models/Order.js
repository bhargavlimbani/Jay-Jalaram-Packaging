const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Product = require("./Product");

const Order = sequelize.define("Order", {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
        "Pending",
        "Accepted",
        "Rejected",
        "In Production",
        "Completed",
        "Delivered"
    ),
    defaultValue: "Pending",
},
});

// Relationships
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Product.hasMany(Order, { foreignKey: "product_id" });
Order.belongsTo(Product, { foreignKey: "product_id" });

module.exports = Order;