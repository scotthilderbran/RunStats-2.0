const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/getToken");
require("../middlewares/passport")(passport);
const Run = require("../database/models/Run");

/* 
run.js contains all routes under /run to handle user run CRUD operations
*/

/* 
PROTECTED - Get all runs route returns all of users runs
*/
router.get(
  "/getAllRuns",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - run/getAllRuns GET REQUEST");
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      Run.findAll({
        where: {
          runner_id: userId,
        },
        raw: true,
      })
        .then((run) => {
          res.json(run);
          res.status(200);
          console.log("getAllRuns response sent");
        })
        .catch((err) => {
          console.log("Error");
          console.log(err);
        });
    } else {
      console.log("Unauthorized");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

/* 
PROTECTED - Route to add user run
*/
router.post(
  "/addRun",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - run/addRun POST request");
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      if (req.body.distance <= 0 || req.body.distance <= 0) {
        return res.status(401).send({
          success: false,
          message: "Please enter positive values only",
        });
      }
      Run.create({
        note: req.body.note,
        distance: req.body.distance,
        time: req.body.time,
        date: req.body.date,
        runner_id: userId,
      })
        .then((run) => {
          console.log("Adding following run:");
          console.log(run);
          res.status(200).send("Run added");
        })
        .catch((err) => console.log(err));
    } else {
      console.log("Unauthorized");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

/* 
PROTECTED - Route to delete user run
 */
router.post(
  "/deleteRun",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - run/deleteRun POST request");
    console.log(req.body.id);
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      Run.destroy({
        //Delete specified run
        where: {
          id: req.body.id,
          runner_id: userId,
        },
      })
        .then(() => {
          console.log("Run Deleted:");
          res.status(200).send("Run deleted");
        })
        .catch((err) => console.log(err));
    } else {
      console.log("Unauthorized");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

/* 
PROTECTED - Route to update user run
*/
router.post(
  "/updateRun",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - run/updateRun POST request");
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      console.log(req.body);
      console.log(userId);
      if (req.body.distance <= 0 || req.body.distance <= 0) {
        return res.status(401).send({
          success: false,
          message: "Please enter positive values only",
        });
      }
      Run.update(
        {
          note: req.body.note,
          distance: req.body.distance,
          time: req.body.time,
          date: req.body.date,
        },
        {
          where: { runner_id: userId, id: req.body.id },
        }
      )
        .then(() => {
          console.log("here");
          res.sendStatus(200);
        })
        .catch((err) => console.log(err));
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

module.exports = router;
