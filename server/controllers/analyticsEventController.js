const asyncHandler = require("../middleware/asyncHandler");
const analyticsEventService = require("../services/analyticsEventService");

exports.createEvent = asyncHandler(async (req, res) => {
  await analyticsEventService.createEvent({
    userId: req.userId,
    event: req.body.event,
    payload: req.body.payload ?? null,
  });

  res.status(201).json({ status: "success" });
});

exports.createAbandonedEvent = asyncHandler(async (req, res) => {
  await analyticsEventService.createEvent({
    userId: null,
    event: "workout_abandoned",
    payload: req.body.payload ?? null,
  });

  res.status(201).json({ status: "success" });
});
