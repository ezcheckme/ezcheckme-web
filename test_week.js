const { format, parseISO, startOfWeek, endOfWeek } = require("date-fns");

function getLegacyWeek(d) {
  const target = new Date(d.valueOf());
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
}

const defaultTo = endOfWeek(new Date());
const defaultFrom = new Date(
  defaultTo.getFullYear(),
  defaultTo.getMonth() - 5,
  1
);

const fromDate = defaultFrom;
const toDate = defaultTo;

let deltaInDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24);
deltaInDays += fromDate.getDay();

const datesJump = 7;
const generatedIds = [];

for (let i = 0; i <= deltaInDays; i += datesJump) {
  let date = new Date(fromDate);
  date.setDate(date.getDate() + i - date.getDay() + 2);
  const week = getLegacyWeek(date);
  const year = date.getFullYear();
  generatedIds.push(`${year}-${week}`);
}
console.log(generatedIds);
