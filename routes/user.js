const express = require("express");
const router = express.Router();
const db = require('../database/config/database');
const User = require('../database/models/User');


router.get('/', (req, res) =>{
    console.log("it hit");
    User.findAll()
    .then(user => {
        console.log(user);
    })
    .catch(err => console.log(err));
});

module.exports = { router: router, prefix: "/user" };


