const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/getToken");
require("../middlewares/passport")(passport);
const Run = require("../database/models/Run");
const sequelize = require("../database/config/database");

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

/* 
PROTECTED - Analytics route
*/
router.get(
  "/getTotals",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    console.log("PROTECTED - run/getTotals GET REQUEST");
    console.log("dabdfkjasdjfhalksdhfkjahflkahlkfhalsdhfla");
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      let distanceSum;
      let timeSum;
      let runCount;
      await Run.sum("distance", {
        where: {
          runner_id: userId,
        },
        raw: true,
      })
        .then((data) => {
          distanceSum = data;
        })
        .catch((err) => {
          console.log("Error");
          console.log(err);
        });
      await Run.sum("time", {
        where: {
          runner_id: userId,
        },
        raw: true,
      })
        .then((data) => {
          timeSum = data;
        })
        .catch((err) => {
          console.log("Error");
          console.log(err);
        });
      await Run.count({
        where: {
          runner_id: userId,
        },
        raw: true,
      })
        .then((data) => {
          runCount = data;
        })
        .catch((err) => {
          console.log("Error");
          console.log(err);
        });
      let avgPace = timeSum / distanceSum;
      let slowerCount;
      let totalCount;
      await sequelize
        .query(
          `select count(*) from (select u.id, (sum(r.time)/sum(r.distance)) as pace from "user" u, "run" r
      where u.id = r.runner_id
      group by u.id) as r
      where r.pace > ${avgPace};`
        )
        .spread((results, metadata) => {
          console.log(results[0].count);
          slowerCount = results[0].count;
        });
      await Run.count({ distinct: true, col: "runner_id" }).then((data) => {
        console.log("Output::::::");
        console.log(data);
        totalCount = data;
      });
      let pacePercentile;
      if (slowerCount === 0) {
        pacePercentile = 0;
      } else {
        pacePercentile = (slowerCount / totalCount) * 100;
      }
      let finalPercentile = Math.floor(pacePercentile);
      console.log(finalPercentile);
      res.status(200).json({
        distanceSum: distanceSum,
        timeSum: timeSum,
        runCount: runCount,
        pacePercentile: finalPercentile,
      });
    } else {
      console.log("Unauthorized");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

module.exports = router;
