const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("../passport")(passport);
const getToken = require("../helpers/getToken");

router.get("/", (req, res) => {
  console.log("it hit");
  console.log(req.body.id);
  User.findAll({})
    .then(user => {
      console.log(user);
      res.status(200);
    })
    .catch(err => console.log(err));
});


router.post("/register", function(req, res) {
  console.log(req.body);
  if (!req.body.email || !req.body.password) {
    res.status(400).send({ msg: "Please pass username and password." });
  } else {
    User.create({
      email: req.body.email,
      password: req.body.password,
      userFName: req.body.fName,
      userLName: req.body.lName,
      sex: req.body.sex
    })
      .then(user => res.status(201).send(user))
      .catch(error => {
        console.log(error);
        res.status(400).send(error);
      });
  }
});

router.post("/login", function(req, res) {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(401).send({
          message: "Authentication failed. User not found."
        });
      }
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign(
            JSON.parse(JSON.stringify(user)),
            process.env.AUTH_SECRET,
            { expiresIn: 86400 * 30 }
          );
          jwt.verify(token, process.env.AUTH_SECRET, function(err, data) {
            console.log(err, data);
          });
          res.json({ success: true, token: "JWT " + token });
        } else {
          res
            .status(401)
            .send({
              success: false,
              msg: "Authentication failed. Wrong password."
            });
        }
      });
    })
    .catch(error => res.status(400).send(error));
});

module.exports = router;
