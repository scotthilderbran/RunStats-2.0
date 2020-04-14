const Sequelize = require("sequelize");

let sequelize = null;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    host: "<heroku host>",
    logging: true, //false
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    "postgres",
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
      operatorsAliases: false,

      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;
