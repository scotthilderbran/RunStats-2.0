/**
 * percentileCheck returns final percentile, returns 100 if only 1 total runner and 0 if slower count is 0
 */
const percentileCheck = (slowerCount, totalCount) => {
  console.log("In percentile check");
  if (slowerCount == 0) {
    if (totalCount == 1) {
      return 100;
    } else {
      console.log("Perentile output 0;");
      return 0;
    }
  } else {
    console.log("Perentile check output;");
    console.log((slowerCount / totalCount) * 100);
    return (slowerCount / totalCount) * 100;
  }
};

module.exports = {
  percentileCheck: percentileCheck,
};
