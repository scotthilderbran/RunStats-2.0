require('dotenv').config({path: __dirname + '/config.env'})
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require("path");
const fs = require("fs");
const db = require('./database/config/database');


const user = require('./routes/user');
const run = require('./routes/run');

const passport    = require('passport');

require('./passport');



const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port:${PORT}`));
console.log(process.env.DB_PASS);

db.authenticate()
    .then(()=> console.log("connected"))
    .catch(()=> console.log("Error"))

app.use('/user', user);
app.use('/run', run);




