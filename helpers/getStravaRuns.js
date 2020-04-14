const axios = require("axios");

const getStravaRuns = async (accessToken, page) => {
  const config = {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
  currTime = Math.floor(new Date() / 1000);
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

const getRuns = async (accessToken, id, callback) => {
  let count = await getTotalCount(accessToken, id);
  let runs = [];
  for (let i = 0; i < count; i++) {
    runs.push(await getStravaRuns(accessToken, i + 1));
  }
  console.log("runslengtj");
  console.log(runs.length);
  let newArr = [].concat.apply([], runs);
  let out = [];
  let output = newArr.filter((run) => {
    return run.type === "Run";
  });
  callback(output);
};

module.exports = getRuns;
