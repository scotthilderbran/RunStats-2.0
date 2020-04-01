const Sequelize = require('sequelize');
const db = require('../config/database');

const Run = db.define('run',{
    id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement : true
    },
    distance: {
        type: Sequelize.DECIMAL(6,3),
        allowNull: false
    },
    time: {
        type: Sequelize.DECIMAL(7,2),
        allowNull: false
    },
    runnerid: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
    },
    {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )
module.exports = Run;