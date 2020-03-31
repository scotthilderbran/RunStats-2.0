const Sequelize = require('sequelize');
const db = require('../config/database');

const User = db.define('user',{
    id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement : true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userFName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userLName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sex: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    }
    },
    {
        freezeTableName: true // Model tableName will be the same as the model name
      }
    )
module.exports = User;