const { AnalyticsEvent } = require("../models/AnalyticsEvent");

const createEvent = async ({ userId, event, payload = null }) => {
  return AnalyticsEvent.create({ userId, event, payload });
};

module.exports = { createEvent };
