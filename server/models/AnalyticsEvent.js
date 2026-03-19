const mongoose = require("mongoose");

const analyticsEventSchema = new mongoose.Schema({
  // userId is optional (default: null) — the unauthenticated /abandoned route
  // creates events without a logged-in user
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  event: { type: String, required: true, maxlength: 100 },
  payload: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
});

// TTL index: auto-delete events older than 90 days
analyticsEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

// Compound index for querying by event type + time range
analyticsEventSchema.index({ event: 1, createdAt: 1 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

module.exports = { AnalyticsEvent };
