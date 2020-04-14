const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const getToken = require("../helpers/getToken");
require("../passport")(passport);
const axios = require("axios");
const getRuns = require("../helpers/getStravaRuns");
const Run = require("../database/models/Run");

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
      axios
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
            for (let i = 0; i < runs.length; i++) {
              Run.findOrCreate({
                where: { strava_run_id: runs[i].id },
                defaults: {
                  runnerid: userId,
                  note: runs[i].name,
                  distance: (runs[i].distance * 0.000621371192).toFixed(3),
                  time: (runs[i].moving_time / 60).toFixed(3),
                  date: runs[0].start_date.substring(0, 10),
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
