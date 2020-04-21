const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("../middlewares/passport")(passport);
const getToken = require("../helpers/getToken");

/* User.js handles all routes under /user including registration, login, user loading, and user profile updates */

/* 
PUBLIC - User registration route
*/
router.post("/register", function (req, res) {
  console.log("PUBLIC - user/register POST request");
  if (
    //Check if all required fields are in request body
    !req.body.email ||
    !req.body.password ||
    !req.body.fName ||
    !req.body.lName ||
    !req.body.sex ||
    !req.body.age
  ) {
    res.status(400).send({ message: "Please enter all fields" });
  } else if (req.body.age > 120 || req.body.age < 0) {
    //check to see if age is between 1 and 120
    res.status(400).send({ message: "Please age range between 1 and 120" });
  } else {
    User.findOne({
      //Check if user is already created
      where: {
        email: req.body.email,
      },
      raw: true,
    }).then((user) => {
      if (!user) {
        //If no user is found then create user
        console.log("in registration body:");
        console.log(req.body);
        User.create({
          email: req.body.email.toLowerCase().replace(/\s/g, ""),
          password: req.body.password,
          user_f_name: req.body.fName,
          user_l_name: req.body.lName,
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
            res.status(201).json({
              success: true,
              token: "JWT " + token,
              user: {
                email: req.body.email.toLowerCase().replace(/\s/g, ""),
                password: req.body.password,
                userFName: req.body.fName,
                userLNname: req.body.lName,
                sex: req.body.sex,
                age: req.body.age,
              },
            });
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

/* 
PUBLIC - User login route
*/
router.post("/login", function (req, res) {
  console.log("PUBLIC - user/login POST request");
  if (!req.body.email || !req.body.password) {
    //Check if email and password are included in request body
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
          //Function in user model to compare plaintext request password with hashed password stored in DB
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
              //Return success with JWT token along with user data
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
              // If password doesnt match return 401
              success: false,
              message: "Authentication failed. Wrong email/password.",
            });
          }
        });
      })
      .catch((error) => res.status(400).send(error));
  }
});

/* 
PROTECTED - Route to load user data
*/
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

/* 
PROTECTED - Route to update user information
*/
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
        // Check if user email already exists
        where: {
          email: req.body.email.toLowerCase().replace(/\s/g, ""),
        },
        raw: true,
      }).then((user) => {
        if (!user || req.body.email === email) {
          if (req.body.age > 120 || req.body.age < 0) {
            // Check that age is between 1 and 120
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
                //Respond with updated user information
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
