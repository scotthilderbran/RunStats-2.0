const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/getToken");
require("../middlewares/passport")(passport);
const Run = require("../database/models/Run");

/**
 * run.js contains all routes under /run to handle user run CRUD operations
 */

/**
 * PRIVATE - REQUIRES JWT IN HEADER
 * @api [get] /run/getAllRuns
 * description: "Load all user runs"
 * responses:
 *    200: JSON object of all runs
 *    401: Invalid JWT, unauthorized
 *    500: Internal server error
 */
router.get(
  "/getAllRuns",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - run/getAllRuns GET REQUEST");
    let token = getToken(req.headers);
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
          return res.status(200).json(run);
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
 * @api [post] /run/addRun
 * description: "Add run for user"
 * body: JSON object {note, distance, time, date}
 * responses:
 *    201: Run added
 *    400: Distance or time out of range
 *    401: Invalid JWT, unauthorized
 *    500: Internal server error
 */
router.post(
  "/addRun",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - run/addRun POST request");
    let token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      if (
        req.body.distance <= 0 ||
        req.body.distance <= 0 ||
        req.body.time <= 0
      ) {
        return res.status(400).send({
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
        .then(() => {
          return res.sendStatus(201);
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
 * @api [post] /run/deleteRun
 * description: "Delete run for user"
 * body: JSON object {id} (run id to delete)
 * responses:
 *    200: Run deleted
 *    401: Invalid JWT, unauthorized
 *    500: Internal server error
 */

router.post(
  "/deleteRun",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - run/deleteRun POST request");
    console.log(req.body.id);
    let token = getToken(req.headers);
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
          return res.sendStatus(200);
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
 * @api [get] /run/updateRun
 * description: "Update run for user"
 * body: {note, distance, time, date}
 * responses:
 *    200: Run updated
 *    400: Distance or time out of range
 *    401: Invalid JWT, unauthorized
 *    500: Internal server error
 */

router.post(
  "/updateRun",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("PROTECTED - run/updateRun POST request");
    let token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      console.log(req.body);
      console.log(userId);
      if (
        req.body.distance <= 0 ||
        req.body.distance <= 0 ||
        req.body.time <= 0
      ) {
        return res.status(400).send({
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
          return res.sendStatus(200);
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

module.exports = router;
