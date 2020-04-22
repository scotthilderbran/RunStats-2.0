const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/getToken");
require("../middlewares/passport")(passport);
const Run = require("../database/models/Run");
const sequelize = require("../database/config/database");
const queries = require("../helpers/queries");
const slowerPaceBySex = queries.slowerPaceBySex;
const countOfRunnersBySex = queries.countOfRunnersBySex;
const getPaceAndTotals = queries.getPaceAndTotals;
const slowerPaceByAll = queries.slowerPaceByAll;
const slowerPaceByAge = queries.slowerPaceByAge;
const countOfRunnersByAge = queries.countOfRunnersByAge;
const check = require("../helpers/percentile");
const percentileCheck = check.percentileCheck;

router.get(
  "/getTotals",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    console.log("PROTECTED - analytic/getTotals GET REQUEST");
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      const age = decoded.age;
      let ageHigh;
      let ageLow;
      if (age <= 20) {
        ageLow = 0;
        ageHigh = 20;
      } else if (age <= 30) {
        ageLow = 21;
        ageHigh = 30;
      } else if (age <= 40) {
        ageLow = 31;
        ageHigh = 40;
      } else if (age <= 50) {
        ageLow = 41;
        ageHigh = 50;
      } else {
        ageLow = 51;
        ageHigh = 120;
      }
      let pace;

      let distanceSum;
      let timeSum;
      await sequelize
        .query(getPaceAndTotals(userId))
        .spread((results, metadata) => {
          pace = results[0].pace;
          distanceSum = results[0].distance;
          timeSum = results[0].time;
        });
      let slowerCountBySex;
      let totalCountBySex;
      await sequelize
        .query(slowerPaceBySex(decoded.sex, pace))
        .spread((results, metadata) => {
          slowerCountBySex = results[0].count;
        });
      await sequelize
        .query(countOfRunnersBySex(decoded.sex))
        .spread((results, metadata) => {
          totalCountBySex = results[0].count;
        });
      let slowerCountByAge;
      let totalCountByAge;
      await sequelize
        .query(slowerPaceByAge(ageLow, ageHigh, pace))
        .spread((results, metadata) => {
          slowerCountByAge = results[0].count;
        });
      await sequelize
        .query(countOfRunnersByAge(ageLow, ageHigh, pace))
        .spread((results, metadata) => {
          totalCountByAge = results[0].count;
        });
      let runCount;
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
      let slowerCountByAll;
      let totalCountByAll;
      await sequelize
        .query(slowerPaceByAll(pace))
        .spread((results, metadata) => {
          slowerCountByAll = results[0].count;
        });
      await Run.count({ distinct: true, col: "runner_id" }).then((data) => {
        totalCountByAll = data;
      });
      let finalPercentileByAll = Math.floor(
        percentileCheck(slowerCountByAll, totalCountByAll)
      );
      let finalPercentileBySex = Math.floor(
        percentileCheck(slowerCountBySex, totalCountBySex)
      );
      let finalPercentileByAge = Math.floor(
        percentileCheck(slowerCountByAge, totalCountByAge)
      );
      let finalPace = parseFloat(pace).toFixed(3);
      res.status(200).json({
        distanceSum: distanceSum,
        timeSum: timeSum,
        runCount: runCount,
        finalPace: finalPace,
        finalPercentileByAll: finalPercentileByAll,
        finalPercentileBySex: finalPercentileBySex,
        finalPercentileByAge: finalPercentileByAge,
        ageLow: ageLow,
        ageHigh: ageHigh,
      });
    } else {
      console.log("Unauthorized");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

module.exports = router;
