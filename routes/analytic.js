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
const countOfRunnersByAgeAndSex = queries.countOfRunnersByAgeAndSex;
const slowerPaceByAgeAndSex = queries.slowerPaceByAgeAndSex;
const check = require("../helpers/percentile");
const percentileCheck = check.percentileCheck;

const marathonQueries = require("../helpers/marathonQueries");
const getSlowerCountPaceMarathon = marathonQueries.getSlowerCountPaceMarathon;
const getTotalCountMarathon = marathonQueries.getTotalCountMarathon;
const slowerCountBySexMarathon = marathonQueries.slowerCountBySexMarathon;
const getTotalCountBySexMarathon = marathonQueries.getTotalCountBySexMarathon;
const slowerCountByAgeMarathon = marathonQueries.slowerCountByAgeMarathon;
const getTotalCountByAgeMarathon = marathonQueries.getTotalCountByAgeMarathon;
const getTotalCountByAgeAndSexMarathon =
  marathonQueries.getTotalCountByAgeAndSexMarathon;
const slowerCountByAgeAndSexMarathon =
  marathonQueries.slowerCountByAgeAndSexMarathon;

/**
 * analytic.js contains all routes under /analytic to return totals and benchmarks to user
 */

/**
 * PRIVATE - REQUIRES JWT IN HEADER
 * @api [get] /analytic/getTotals
 * description: "Returns percentiles compared to RunStats users and Boston Marathon runners along with user totals"
 * responses:
 *    200: JSON object of all totals/benchmarks
 *    401: Invalid JWT, unauthorized
 *    500: Internal server error
 */
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
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      let slowerCountBySex;
      let totalCountBySex;
      await sequelize
        .query(slowerPaceBySex(decoded.sex, pace))
        .spread((results, metadata) => {
          slowerCountBySex = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      await sequelize
        .query(countOfRunnersBySex(decoded.sex))
        .spread((results, metadata) => {
          totalCountBySex = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      let slowerCountByAge;
      let totalCountByAge;
      await sequelize
        .query(slowerPaceByAge(ageLow, ageHigh, pace))
        .spread((results, metadata) => {
          slowerCountByAge = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      await sequelize
        .query(countOfRunnersByAge(ageLow, ageHigh, pace))
        .spread((results, metadata) => {
          totalCountByAge = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
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
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      let slowerCountByAll;
      let totalCountByAll;
      await sequelize
        .query(slowerPaceByAll(pace))
        .spread((results, metadata) => {
          slowerCountByAll = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      let slowerCountByAgeAndSex;
      let totalCountByAgeAndSex;
      await sequelize
        .query(slowerPaceByAgeAndSex(ageLow, ageHigh, decoded.sex, pace))
        .spread((results, metadata) => {
          slowerCountByAgeAndSex = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      await sequelize
        .query(countOfRunnersByAgeAndSex(ageLow, ageHigh, decoded.sex))
        .spread((results, metadata) => {
          totalCountByAgeAndSex = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      await Run.count({ distinct: true, col: "runner_id" })
        .then((data) => {
          totalCountByAll = data;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
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
      let finalPercentileByAgeAndSex = Math.floor(
        percentileCheck(slowerCountByAgeAndSex, totalCountByAgeAndSex)
      );
      let finalPace = parseFloat(pace).toFixed(3);
      //Marathon Queries
      let marathonTotalCount;
      let marathonTotalSlowerCount;
      await sequelize
        .query(getSlowerCountPaceMarathon(pace))
        .spread((results, metadata) => {
          marathonTotalSlowerCount = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      await sequelize
        .query(getTotalCountMarathon())
        .spread((results, metadata) => {
          marathonTotalCount = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      let marathonTotalCountBySex;
      let marathonTotalSlowerCountBySex;
      await sequelize
        .query(slowerCountBySexMarathon(decoded.sex, pace))
        .spread((results, metadata) => {
          marathonTotalSlowerCountBySex = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      await sequelize
        .query(getTotalCountBySexMarathon(decoded.sex))
        .spread((results, metadata) => {
          marathonTotalCountBySex = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      let marathonTotalCountByAge;
      let marathonTotalSlowerCountByAge;
      await sequelize
        .query(slowerCountByAgeMarathon(ageLow, ageHigh, pace))
        .spread((results, metadata) => {
          marathonTotalSlowerCountByAge = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      await sequelize
        .query(getTotalCountByAgeMarathon(ageLow, ageHigh))
        .spread((results, metadata) => {
          marathonTotalCountByAge = results[0].count;
          console.log("getTotals marathon by agedadafsadfasdfa");
          console.log(results);
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      let marathonTotalCountByAgeAndSex;
      let marathonTotalSlowerCountByAgeAndSex;
      await sequelize
        .query(
          slowerCountByAgeAndSexMarathon(ageLow, ageHigh, decoded.sex, pace)
        )
        .spread((results, metadata) => {
          marathonTotalSlowerCountByAgeAndSex = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      await sequelize
        .query(getTotalCountByAgeAndSexMarathon(ageLow, ageHigh, decoded.sex))
        .spread((results, metadata) => {
          marathonTotalCountByAgeAndSex = results[0].count;
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      let finalPercentileByAllMarathon = Math.floor(
        percentileCheck(marathonTotalSlowerCount, marathonTotalCount)
      );
      let finalPercentileBySexMarathon = Math.floor(
        percentileCheck(marathonTotalSlowerCountBySex, marathonTotalCountBySex)
      );
      let finalPercentileByAgeMarathon = Math.floor(
        percentileCheck(marathonTotalSlowerCountByAge, marathonTotalCountByAge)
      );
      let finalPercentileByAgeAndSexMarathon = Math.floor(
        percentileCheck(
          marathonTotalSlowerCountByAgeAndSex,
          marathonTotalCountByAgeAndSex
        )
      );
      return res.status(200).json({
        distanceSum: distanceSum,
        timeSum: timeSum,
        runCount: runCount,
        finalPace: finalPace,
        finalPercentileByAll: finalPercentileByAll,
        finalPercentileBySex: finalPercentileBySex,
        finalPercentileByAge: finalPercentileByAge,
        finalPercentileByAgeAndSex: finalPercentileByAgeAndSex,
        finalPercentileByAllMarathon: finalPercentileByAllMarathon,
        finalPercentileBySexMarathon: finalPercentileBySexMarathon,
        finalPercentileByAgeMarathon: finalPercentileByAgeMarathon,
        finalPercentileByAgeAndSexMarathon: finalPercentileByAgeAndSexMarathon,
        ageLow: ageLow,
        ageHigh: ageHigh,
      });
    } else {
      return res.status(401).send({ message: "Unauthorized" });
    }
  }
);

module.exports = router;
