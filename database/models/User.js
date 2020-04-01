const Sequelize = require("sequelize");
const db = require("../config/database");
var bcrypt = require("bcrypt-nodejs");

const User = db.define(
  "user",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
);
User.beforeSave((user, options) => {
  if (user.changed("password")) {
    user.password = bcrypt.hashSync(
      user.password,
      bcrypt.genSaltSync(10),
      null
    );
  }
});
User.prototype.comparePassword = function(passw, cb) {
  bcrypt.compare(passw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};
module.exports = User;
