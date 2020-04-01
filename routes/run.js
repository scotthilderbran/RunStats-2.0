const express = require("express");
const router = express.Router();
const passport = require('passport');
const jwt = require("jsonwebtoken");
const getToken = require('../helpers/getToken');
require('../passport')(passport);
const User = require('../database/models/User');

router.get('/getAllRuns', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
      decoded = jwt.verify(token, process.env.AUTH_SECRET);
      const userId = decoded.id;
      User.findOne({
        where: {
          id: userId
        }
      })
      .then(user => {
        console.log("AUTH SUCCESS")
          console.log(user);
          
          res.status(200);
      })
      .catch(err => console.log(err));
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});
  

module.exports = router;


