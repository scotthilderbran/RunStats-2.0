const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/getToken");
require("../passport")(passport);
const Run = require("../database/models/Run");

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
          runnerid: userId,
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

router.post(
  "/addRun",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - run/addRun POST request");
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      Run.create({
        note: req.body.note,
        distance: req.body.distance,
        time: req.body.time,
        date: req.body.date,
        runnerid: userId,
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
        where: {
          id: req.body.id,
          runnerid: userId,
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
      Run.update(
        {
          note: req.body.note,
          distance: req.body.distance,
          time: req.body.time,
          date: req.body.date,
        },
        {
          where: { runnerid: userId, id: req.body.id },
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
