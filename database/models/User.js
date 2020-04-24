const Sequelize = require("sequelize");
const db = require("../config/database");
var bcrypt = require("bcrypt-nodejs");

/**
 * Creates User model in Sequelize for "user" table
 */
const User = db.define(
  "user",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_f_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_l_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sex: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    age: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true, // Model tableName will be the same as the model name
  }
);
User.beforeSave((user, options) => {
  //if user changed password, rehash password before storing
  if (user.changed("password")) {
    user.password = bcrypt.hashSync(
      user.password,
      bcrypt.genSaltSync(10),
      null
    );
  }
});
User.prototype.comparePassword = function (passw, cb) {
  //Compare hashed password with plaintext password, returns callback
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};
module.exports = User;
