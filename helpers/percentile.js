const percentileCheck = (slowerCount, totalCount) => {
  console.log("In percentile check");
  if (slowerCount == 0) {
    if (totalCount == 1) {
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
