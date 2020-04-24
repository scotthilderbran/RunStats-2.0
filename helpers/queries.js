/**
 * queries.js returns correct queries for generating percentiles and total statistics from just RunStats users
 */

const getPaceAndTotals = (id) => {
  //Gets total time, distance, and pace for selected user
  return `select sum(time) as time, sum(distance) as distance, (sum(time)/sum(distance)) as pace
  from "run" 
  where runner_id = ${id}`;
};

const slowerPaceBySex = (sex, pace) => {
  //Gets total count of slower RunStats users by sex
  return `select count(*) from (select u.email, runner_id, (sum(time)/sum(distance)) as pace from "run" r
    inner join "user" u on u.id=r.runner_id
    where u.sex = ${sex}
    group by runner_id, u.email
    having (sum(time)/sum(distance)) > ${pace}) as outputcount
    `;
};

const countOfRunnersBySex = (sex) => {
  //Gets total count of RunSTats users by sex
  return `select count(distinct runner_id) 
    from "run" r inner join "user" u on r.runner_id = u.id
    where u.sex = ${sex}`;
};

const slowerPaceByAge = (ageLow, ageHigh, pace) => {
  //Gets total count of slower RunStats users by age range
  return `select count(*) from (select u.email, runner_id, (sum(time)/sum(distance)) as pace from "run" r
    inner join "user" u on u.id=r.runner_id
    where u.age between ${ageLow} and ${ageHigh}
    group by runner_id, u.email
    having (sum(time)/sum(distance)) > ${pace}) as outputcount`;
};

const countOfRunnersByAge = (ageLow, ageHigh) => {
  //Gets total count of RunStats users by age range
  return `select count(distinct runner_id) 
    from "run" r inner join "user" u on r.runner_id = u.id
    where u.age between ${ageLow} and ${ageHigh}`;
};
const slowerPaceByAll = (pace) => {
  //Gets total count of all slower RunStats users
  return `select count(*) from (select u.id, (sum(r.time)/sum(r.distance)) as pace from "user" u, "run" r
    where u.id = r.runner_id
    group by u.id) as r
    where r.pace > ${pace};`;
};

const countOfRunnersByAgeAndSex = (ageLow, ageHigh, sex) => {
  //Gets total count of RunStats users by sex and age range
  return `select count(distinct runner_id) 
  from "run" r inner join "user" u on r.runner_id = u.id
  where u.age between ${ageLow} and ${ageHigh}
  and u.sex = ${sex}`;
};

const slowerPaceByAgeAndSex = (ageLow, ageHigh, sex, pace) => {
  //Gets total count of slower RunStats users by sex and age range
  return `select count(*) from (select u.email, runner_id, (sum(time)/sum(distance)) as pace from "run" r
  inner join "user" u on u.id=r.runner_id
  where u.age between ${ageLow} and ${ageHigh}
  and u.sex = ${sex}
  group by runner_id, u.email
  having (sum(time)/sum(distance)) > ${pace}) as outputcount`;
};

module.exports = {
  slowerPaceBySex: slowerPaceBySex,
  countOfRunnersBySex: countOfRunnersBySex,
  getPaceAndTotals: getPaceAndTotals,
  slowerPaceByAge: slowerPaceByAge,
  countOfRunnersByAge: countOfRunnersByAge,
  slowerPaceByAll: slowerPaceByAll,
  countOfRunnersByAgeAndSex: countOfRunnersByAgeAndSex,
  slowerPaceByAgeAndSex: slowerPaceByAgeAndSex,
};
