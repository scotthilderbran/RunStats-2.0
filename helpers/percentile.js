/**
 * percentileCheck returns final percentile, returns 100 if only 1 total runner and 0 if slower count is 0
 */
const percentileCheck = (slowerCount, totalCount) => {
  if (slowerCount == 0) {
    if (totalCount == 1) {
      //If only runner in certain group return 100% percentile
      return 100;
    } else {
      return 0;
    }
  } else {
    return (slowerCount / totalCount) * 100;
  }
};

module.exports = {
  percentileCheck: percentileCheck,
};
