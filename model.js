const Sequelize = require("sequelize");
const sequelize = require("./db");

const Tags = sequelize.define("tags", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  link: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  user: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  votes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Tags;
