const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("jai_jalaram", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => console.log("MySQL Connected ✅"))
  .catch((err) => console.error("MySQL Connection Failed ❌", err));

module.exports = sequelize;