const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("../passport")(passport);
const getToken = require("../helpers/getToken");

router.post("/register", function (req, res) {
  //Add data to find if user email exists already or not and return it
  console.log("PUBLIC - user/register POST request");
  console.log(req.body);
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.fName ||
    !req.body.lName ||
    !req.body.sex ||
    !req.body.age
  ) {
    res.status(400).send({ message: "Please enter all fields" });
  } else if (req.body.age > 120 || req.body.age <= 0) {
    res.status(400).send({ message: "Please age range between 1 and 120" });
  } else {
    User.findOne({
      where: {
        email: req.body.email,
      },
      raw: true,
    }).then((user) => {
      if (!user) {
        User.create({
          email: req.body.email.toLowerCase().replace(/\s/g, ""),
          password: req.body.password,
          userFName: req.body.fName,
          userLName: req.body.lName,
          sex: req.body.sex,
          age: req.body.age,
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
      } else {
        res.status(401).send({
          success: false,
          message: "Please login, email already in use",
        });
      }
    });
  }
});

router.post("/login", function (req, res) {
  console.log("PUBLIC - user/login POST request");
  if (!req.body.email || !req.body.password) {
    res.status(400).send({ message: "Please enter all fields" });
  } else {
    User.findOne({
      where: {
        email: req.body.email.toLowerCase().replace(/\s/g, ""),
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
                userFName: user.user_f_name,
                userLName: user.user_l_name,
              },
            });
          } else {
            res.status(401).send({
              success: false,
              message: "Authentication failed. Wrong email/password.",
            });
          }
        });
      })
      .catch((error) => res.status(400).send(error));
  }
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
          res.json({
            email: user.email,
            userFName: user.user_f_name,
            userLName: user.user_l_name,
            sex: user.sex,
            age: user.age,
          });
          res.status(200);
        })
        .catch((err) => console.log(err));
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

router.post(
  "/update",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - user/update POST request");
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      const email = decoded.email;
      console.log("decoded email");
      console.log(email);
      User.findOne({
        where: {
          email: req.body.email.toLowerCase().replace(/\s/g, ""),
        },
        raw: true,
      }).then((user) => {
        if (!user || req.body.email === email) {
          if (req.body.age > 120 || req.body.age <= 0) {
            res
              .status(400)
              .send({ message: "Please age range between 1 and 120" });
          } else {
            User.update(
              {
                email: req.body.email.toLowerCase().replace(/\s/g, ""),
                password: req.body.password,
                user_f_name: req.body.fName,
                user_l_name: req.body.lName,
                sex: req.body.sex,
                age: req.body.age,
              },
              {
                where: { id: userId },
              }
            )
              .then((user) => {
                res.json({
                  email: user.email,
                  userFName: user.user_f_name,
                  userLName: user.user_l_name,
                  sex: user.sex,
                  age: user.age,
                });
                res.status(200);
              })
              .catch((err) => console.log(err));
          }
        } else {
          res.status(401).send({
            success: false,
            message: "Email already in use",
          });
        }
      });
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

module.exports = router;
