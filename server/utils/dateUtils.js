const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const startOfUtcDay = (value = new Date()) => {
  const date = new Date(value);

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

const addUtcDays = (value, days) => {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

const getUtcDayDifference = (laterValue, earlierValue) => {
  const later = startOfUtcDay(laterValue);
  const earlier = startOfUtcDay(earlierValue);

  return Math.floor((later.getTime() - earlier.getTime()) / DAY_IN_MILLISECONDS);
};

const startOfIsoWeek = (value = new Date()) => {
  const date = new Date(value);
  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diffToMonday);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const endOfIsoWeek = (weekStart) => {
  const date = new Date(weekStart);
  date.setUTCDate(date.getUTCDate() + 6);
  date.setUTCHours(23, 59, 59, 999);
  return date;
};

const getIsoWeekDay = (value = new Date()) => {
  const day = new Date(value).getUTCDay();
  return day === 0 ? 7 : day;
};

module.exports = {
  DAY_IN_MILLISECONDS,
  addUtcDays,
  endOfIsoWeek,
  getIsoWeekDay,
  getUtcDayDifference,
  startOfIsoWeek,
  startOfUtcDay,
};
