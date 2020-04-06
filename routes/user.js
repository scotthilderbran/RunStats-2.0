const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("../passport")(passport);
const getToken = require("../helpers/getToken");

router.post("/register", function (req, res) {
  console.log("PUBLIC - user/register POST request");
  if (!req.body.email || !req.body.password) {
    res.status(400).send({ msg: "Please pass username and password." });
  } else {
    User.create({
      email: req.body.email,
      password: req.body.password,
      userFName: req.body.fName,
      userLName: req.body.lName,
      sex: req.body.sex,
    })
      .then((user) => {
        let token = jwt.sign(
          JSON.parse(JSON.stringify(user)),
          process.env.AUTH_SECRET,
          { expiresIn: "4h" }
        );
        jwt.verify(token, process.env.AUTH_SECRET, function (err, data) {
          console.log(err, data);
        });
        console.log("User created");
        res.json({ success: true, token: "JWT " + token });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).send(error);
      });
  }
});

router.post("/login", function (req, res) {
  console.log("PUBLIC - user/login POST request");
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(401).send({
          message: "Authentication failed. User not found.",
        });
      }
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign(
            JSON.parse(JSON.stringify(user)),
            process.env.AUTH_SECRET,
            { expiresIn: 86400 * 30 }
          );
          jwt.verify(token, process.env.AUTH_SECRET, function (err, data) {
            console.log(err, data);
          });
          res.json({
            success: true,
            token: "JWT " + token,
            user: {
              email: user.email,
              userFName: user.userFName,
              userLName: user.userLName,
            },
          });
        } else {
          res.status(401).send({
            success: false,
            msg: "Authentication failed. Wrong password.",
          });
        }
      });
    })
    .catch((error) => res.status(400).send(error));
});

router.get(
  "/loadUser",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - user/loadUser GET request");
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      User.findOne({
        where: {
          id: userId,
        },
        raw: true,
      })
        .then((user) => {
          console.log("this is the user");
          console.log(user);
          res.json({
            email: user.email,
            userFName: user.userFName,
            userLName: user.userLName,
          });
          res.status(200);
        })
        .catch((err) => console.log(err));
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

module.exports = router;
