const express = require("express");
const router = express.Router();
const passport = require('passport');
const jwt = require("jsonwebtoken");
const getToken = require('../helpers/getToken');
require('../passport')(passport);
const Run = require('../database/models/Run');

router.get('/getAllRuns', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      Run.findAll({
        where: {
          runnerid: userId
        }
      })
      .then(run => {
          console.log(run);
          res.json(run);
          res.status(200);
      })
      .catch(err => console.log(err));
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.post('/addRun', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      Run.create({
        distance: req.body.distance,
        time: req.body.time,
        runnerid: userId
      })
      .then(run => {
          console.log(run);
          res.status(200).send("run added");
      })
      .catch(err => console.log(err));
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});
  

module.exports = router;


