const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/getToken");
require("../middlewares/passport")(passport);
const axios = require("axios");
const getRuns = require("../helpers/getStravaRuns");
const Run = require("../database/models/Run");

/**
 * strava.js handles all routes under /strava, mainly the token exchange
 */

/**
 * PRIVATE - REQUIRES JWT IN HEADER
 * @api [post] /strava/stravaImport
 * description: "Exchanges Strava token and imports runs"
 * responses:
 *    200: Strava runs imported
 *    401: Invalid JWT, unauthorized
 *    500: Internal server error
 */
router.post(
  "/stravaImport",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      await axios //Get access token for user using client id, client secret, and users auth code
        .post(
          "https://www.strava.com/oauth/token?client_id=" +
            process.env.STRAVA_CLIENT_ID +
            "&client_secret=" +
            process.env.STRAVA_CLIENT_SECRET +
            "&code=" +
            req.body.code +
            "&grant_type=authorization_code"
        )
        .then((res) => {
          getRuns(res.data.access_token, res.data.athlete.id, (runs) => {
            // Call getRuns function, returns callback function with array of strava runs
            for (let i = 0; i < runs.length; i++) {
              Run.findOrCreate({
                //Check if run of same strava id has already been imported and if not then create new run
                where: { strava_run_id: runs[i].id },
                defaults: {
                  runner_id: userId,
                  note: runs[i].name,
                  distance: (runs[i].distance * 0.000621371192).toFixed(3),
                  time: (runs[i].moving_time / 60).toFixed(3),
                  date: runs[i].start_date.substring(0, 10),
                  strava_run_id: runs[i].id,
                },
              });
            }
          });
        })
        .catch((err) => {
          console.log("Sever error:");
          console.log(err);
          return res.status(500).send(err);
        });
      return res.sendStatus(200);
    } else {
      return res.status(401).send({ message: "Unauthorized." });
    }
  }
);

module.exports = router;
