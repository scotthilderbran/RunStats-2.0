const getPaceAndTotals = (id) => {
  return `select sum(time) as time, sum(distance) as distance, (sum(time)/sum(distance)) as pace
  from "run" 
  where runner_id = ${id}`;
};

const slowerPaceBySex = (sex, pace) => {
  return `select count(*) from (select u.email, runner_id, (sum(time)/sum(distance)) as pace from "run" r
    inner join "user" u on u.id=r.runner_id
    where u.sex = ${sex}
    group by runner_id, u.email
    having (sum(time)/sum(distance)) > ${pace}) as outputcount
    `;
};

const countOfRunnersBySex = (sex) => {
  return `select count(distinct runner_id) 
    from "run" r inner join "user" u on r.runner_id = u.id
    where u.sex = ${sex}`;
};

const slowerPaceByAge = (ageLow, ageHigh, pace) => {
  return `select count(*) from (select u.email, runner_id, (sum(time)/sum(distance)) as pace from "run" r
    inner join "user" u on u.id=r.runner_id
    where u.age between ${ageLow} and ${ageHigh}
    group by runner_id, u.email
    having (sum(time)/sum(distance)) > ${pace}) as outputcount`;
};

const countOfRunnersByAge = (ageLow, ageHigh) => {
  return `select count(distinct runner_id) 
    from "run" r inner join "user" u on r.runner_id = u.id
    where u.age between ${ageLow} and ${ageHigh}`;
};
const slowerPaceByAll = (pace) => {
  return `select count(*) from (select u.id, (sum(r.time)/sum(r.distance)) as pace from "user" u, "run" r
    where u.id = r.runner_id
    group by u.id) as r
    where r.pace > ${pace};`;
};

module.exports = {
  slowerPaceBySex: slowerPaceBySex,
  countOfRunnersBySex: countOfRunnersBySex,
  getPaceAndTotals: getPaceAndTotals,
  slowerPaceByAge: slowerPaceByAge,
  countOfRunnersByAge: countOfRunnersByAge,
  slowerPaceByAll: slowerPaceByAll,
};
