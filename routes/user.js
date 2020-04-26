const express = require("express");
const router = express.Router();
const User = require("../database/models/User");
const jwt = require("jsonwebtoken");
const passport = require("passport");
//require("../middlewares/passport")(passport);
const getToken = require("../helpers/getToken");

/**
 * User.js handles all routes under /user including registration, login, user loading, and user profile updates
 */

/**
 * PUBLIC
 * @api [post] /user/register
 * description: "Register's user in RunStats database"
 * body: JSON object including {email, password, fName, lName, sex, age}
 * responses:
 *    201: User registered - responds with valid JWT
 *    400: Missing fields, fields out of range, or email already in use
 *    500: Internal server error
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
              { expiresIn: 900 }
            );
            jwt.verify(token, process.env.AUTH_SECRET, function (err, data) {
              console.log(err, data);
            });
            console.log("User created");
            res.status(201).json({
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
          .catch((err) => {
            console.log("Sever error:");
            console.log(err);
            res.status(500).send(err);
          });
      } else {
        res.status(400).send({
          message: "Please login, email already in use",
        });
      }
    });
  }
});

/**
 * PUBLIC
 * @api [post] /user/login
 * description: "login user to RunStats"
 * body: JSON object including {email, password}
 * responses:
 *    200: User logged in, returns valid JWT
 *    400: Missing fields, fields out of range
 *    401: User not found/wrong email password
 *    500: Internal server error
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
            let token = jwt.sign(
              JSON.parse(JSON.stringify(user)),
              process.env.AUTH_SECRET,
              { expiresIn: 900 }
            );
            jwt.verify(token, process.env.AUTH_SECRET, function (err, data) {
              console.log(err, data);
            });
            res.status(200).json({
              //Return success with JWT token along with user data
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
              message: "Authentication failed. Wrong email/password.",
            });
          }
        });
      })
      .catch((err) => {
        console.log("Sever error:");
        console.log(err);
        res.status(500).send(err);
      });
  }
});

/**
 * PRIVATE - REQUIRES JWT IN HEADER
 * @api [get] /user/authCheck
 * description: "Verify current JWT and return refreshed JWT"
 * responses:
 *    200: Valid JWT returns refreshed JWT
 *    401: Invalid JWT, user session timed out
 */

router.get(
  "/authCheck",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - user/loadUser GET request");
    let token = getToken(req.headers);
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
          let token = jwt.sign(
            JSON.parse(JSON.stringify(user)),
            process.env.AUTH_SECRET,
            { expiresIn: 900 }
          );
          jwt.verify(token, process.env.AUTH_SECRET, function (err, data) {
            console.log(err, data);
          });
          return res.status(200).json({
            //Return success with JWT token along with user data
            token: "JWT " + token,
          });
        })
        .catch((err) => console.log(err));
    } else {
      return res.status(401).send({ msg: "User timed out" });
    }
  }
);

/**
 * PRIVATE - REQUIRES JWT IN HEADER
 * @api [get] /user/loadUser
 * description: "Load user information"
 * responses:
 *    200: Returns user information
 *    401: Invalid JWT, unauthorized
 *    500: Internal server error
 */

router.get(
  "/loadUser",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - user/loadUser GET request");
    let token = getToken(req.headers);
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
          return res.status(200).json({
            email: user.email,
            userFName: user.user_f_name,
            userLName: user.user_l_name,
            sex: user.sex,
            age: user.age,
          });
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
    } else {
      return res.status(401).send({ message: "Unauthorized" });
    }
  }
);

/**
 * PRIVATE - REQUIRES JWT IN HEADER
 * @api [post] /user/update
 * description: "Updates user information"
 * body: JSON object including {email, password, fName, lName, sex, age}
 * responses:
 *    200: User updated
 *    400: Email already in use or age out of range
 *    401: Invalid JWT, unauthorized.
 *    500: Internal server error
 */

router.post(
  "/update",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - user/update POST request");
    let token = getToken(req.headers);
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
                return res.status(200).json({
                  email: user.email,
                  userFName: user.user_f_name,
                  userLName: user.user_l_name,
                  sex: user.sex,
                  age: user.age,
                });
              })
              .catch((err) => {
                console.log("Sever error:");
                console.log(err);
                res.status(500).send(err);
              });
          }
        } else {
          res.status(400).send({
            message: "Email already in use",
          });
        }
      });
    } else {
      return res.status(401).send({ message: "Unauthorized" });
    }
  }
);

module.exports = router;
