const paceConvert = (pace) => {
  let hr = 00;
  let min;
  let sec;
  let secFinal;
  if (pace >= 60) {
    hr = Math.floor(pace / 60);
    min = Math.floor(pace % 60);
    sec = min % 1;
    secFinal = sec * 60;
  }
  min = Math.floor(pace);
  sec = pace % 1;
  secFinal = sec * 60;
  return hr + ":" + min + ":" + secFinal;
};

const getSlowerCountPaceMarathon = (pace) => {
  let finalPace = paceConvert(pace);
  return `select count(*) from "boston_benchmark"
  where pace > '${finalPace}'`;
};

const getTotalCountMarathon = () => {
  return `select count(*) from "boston_benchmark";`;
};

const slowerCountBySexMarathon = (sex, pace) => {
  let finalPace = paceConvert(pace);
  return `select count(*) from "boston_benchmark"
  where pace > '${finalPace}'
  and sex = ${sex};`;
};

const getTotalCountBySexMarathon = (sex) => {
  return `select count(*) from "boston_benchmark"
  where sex = ${sex};`;
};

const slowerCountByAgeMarathon = (ageLow, ageHigh, pace) => {
  let finalPace = paceConvert(pace);
  return `select count(*) from "boston_benchmark"
  where pace > '${finalPace}'
  and age between ${ageLow} and ${ageHigh}`;
};

const getTotalCountByAgeMarathon = (ageLow, ageHigh) => {
  return `select count(*) from "boston_benchmark"
  where age between ${ageLow} and ${ageHigh}`;
};

const getTotalCountByAgeAndSexMarathon = (ageLow, ageHigh, sex) => {
  return `select count(*) from "boston_benchmark"
  where sex = ${sex}
  and age between ${ageLow} and ${ageHigh}`;
};

const slowerCountByAgeAndSexMarathon = (ageLow, ageHigh, sex, pace) => {
  let finalPace = paceConvert(pace);
  return `select count(*) from "boston_benchmark"
  where sex = ${sex}
  and age between ${ageLow} and ${ageHigh}
  and pace > '${finalPace}'`;
};

module.exports = {
  getSlowerCountPaceMarathon: getSlowerCountPaceMarathon,
  getTotalCountMarathon: getTotalCountMarathon,
  slowerCountBySexMarathon: slowerCountBySexMarathon,
  getTotalCountBySexMarathon: getTotalCountBySexMarathon,
  slowerCountByAgeMarathon: slowerCountByAgeMarathon,
  getTotalCountByAgeMarathon: getTotalCountByAgeMarathon,
  getTotalCountByAgeAndSexMarathon: getTotalCountByAgeAndSexMarathon,
  slowerCountByAgeAndSexMarathon: slowerCountByAgeAndSexMarathon,
};
