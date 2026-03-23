const { Sequelize } = require("sequelize");

const dbName = process.env.DB_NAME || "jai_jalaram";
const dbUser = process.env.DB_USER || "root";
const dbPass = process.env.DB_PASS || "";
const dbHost = process.env.DB_HOST || "localhost";
const dbDialect = process.env.DB_DIALECT || "mysql";

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  dialect: dbDialect,
});

sequelize
  .authenticate()
  .then(() => console.log("MySQL Connected ✅"))
  .catch((err) => console.error("MySQL Connection Failed ❌", err));

module.exports = sequelize;
