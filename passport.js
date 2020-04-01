const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("./database/models/User");

module.exports = function(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
    secretOrKey: process.env.AUTH_SECRET
  };
  passport.use(
    "jwt",
    new JwtStrategy(opts, function(jwt_payload, done) {
      User.findByPk(jwt_payload.id)
        .then(user => {
          console.log("In strat");
          console.log(user.id);
          return done(null, user);
        })
        .catch(error => {
          return done(error, false);
        });
    })
  );
};
