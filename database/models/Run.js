const Sequelize = require("sequelize");
const db = require("../config/database");

const Run = db.define(
  "run",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    distance: {
      type: Sequelize.DECIMAL(6, 3),
      allowNull: false,
    },
    note: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    time: {
      type: Sequelize.DECIMAL(7, 2),
      allowNull: false,
    },
    runnerid: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    strava_run_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true, // Model tableName will be the same as the model name
  }
);
module.exports = Run;
