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

module.exports = {
  DAY_IN_MILLISECONDS,
  addUtcDays,
  getUtcDayDifference,
  startOfUtcDay,
};
