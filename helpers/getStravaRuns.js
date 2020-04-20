const axios = require("axios");

/* getStravaRuns.js contains helper functions to retreive and filter all of users runs */

const getStravaRuns = async (accessToken, page) => {
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  currTime = Math.floor(new Date() / 1000); //Generate epoch timestamp for current datetime, gets all activity after 2010 up to current date. Activities are retreive in groups of 100.
  let res = await axios.get(
    "https://www.strava.com/api/v3/athlete/activities?before=" +
      currTime +
      "&after=1271189038&page=" +
      page +
      "&per_page=100",
    config
  );
  return res.data;
};

/* 
Function to get count of total activities
Strava doesn't have any api routes for just runs so server has to get all activities and filter.
Function returns total count divided by 100 and rounded up.
*/
const getTotalCount = async (accessToken, id) => {
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  let res = await axios.get(
    "https://www.strava.com/api/v3/athletes/" + id + "/stats",
    config
  );
  let totalCount =
    res.data.all_ride_totals.count +
    res.data.all_run_totals.count +
    res.data.all_swim_totals.count;
  let count = Math.ceil(totalCount / 100);
  return count;
};

/* 
Function to get all activities from Strava API
*/
const getRuns = async (accessToken, id, callback) => {
  let count = await getTotalCount(accessToken, id); //Get total count of all activities/100
  let runs = [];
  for (let i = 0; i < count; i++) {
    runs.push(await getStravaRuns(accessToken, i + 1)); //Get strava activities in iterations of 100
  }
  let newArr = [].concat.apply([], runs); //Flatten array so it is not a 2d array
  let output = newArr.filter((run) => {
    //Filter out all non "Run" types
    return run.type === "Run";
  });
  callback(output); //Callback function
};

module.exports = getRuns;
