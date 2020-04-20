const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/getToken");
require("../middlewares/passport")(passport);
const axios = require("axios");
const getRuns = require("../helpers/getStravaRuns");
const Run = require("../database/models/Run");

/* strava.js handles all routes under /strava, mainly the token exchange */

/* 
PROTECTED - Strava token exchange route.
1. User clicks import from strava in client
2. User is redirected to strava OAuth page and client callback url once complete
3. Client checks to make sure relevant permissions are granted
4. Client sends user's unique Strava authorization code to this route
5. Server exchanges auth code for temporary access token
6. Access token is used in ./helpers/getStravaRuns.js to retreive user's runs
*/

router.post(
  "/stravaTokenExchange",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("Strava Token Exchange");
    console.log("Strava Token Exchange");
    console.log("Strava Token Exchange");
    console.log(req.body.code);
    var token = getToken(req.headers);
    if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      axios //Get access token for user using client id, client secret, and users auth code
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
          console.log(err);
        });
      return res.sendStatus(200);
    } else {
      console.log("Unauthorized");
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

module.exports = router;
