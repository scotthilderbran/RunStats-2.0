require("dotenv").config({ path: __dirname + "/config.env" }); //Load enviromental variables
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./database/config/database");
const cors = require("cors");
const user = require("./routes/user");
const run = require("./routes/run");
const strava = require("./routes/strava");
const analytic = require("./routes/analytic");

require("./middlewares/passport");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port:${PORT}`));

db.authenticate()
  .then(() => console.log("Success - Connected to database"))
  .catch(() => console.log("Error - Could not connect to database"));

app.use("/user", user);
app.use("/run", run);
app.use("/strava", strava);
app.use("/analytic", analytic);
