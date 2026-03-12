const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Material = sequelize.define("Material", {

  name: {
    type: DataTypes.STRING,
  },

  stock: {
    type: DataTypes.INTEGER,
  },

  unit: {
    type: DataTypes.STRING,
  }

});

module.exports = Material;