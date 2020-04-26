const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../database/models/User");

/**
 * Middleware function to authenticate user based off request JWT
 */

module.exports = function (passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
    secretOrKey: process.env.AUTH_SECRET, //enviroment variable auth secret.
  };
  passport.use(
    "jwt",
    new JwtStrategy(opts, function (jwt_payload, done) {
      console.log("in jwt strategy");
      User.findByPk(jwt_payload.id) //Check if user
        .then((user) => {
          return done(null, user);
        })
        .catch((error) => {
          return done(error, false);
        });
    })
  );
};
