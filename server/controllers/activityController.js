const asyncHandler = require("../middleware/asyncHandler");
const activityService = require("../services/activityService");
const { ALLOWED_EMOJIS } = require("../models/ActivityEvent");
const AppError = require("../utils/AppError");
const { validateObjectId } = require("../utils/validationHelpers");

exports.getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const result = await activityService.getActivityFeed({ userId: req.userId, page });

  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.addReaction = asyncHandler(async (req, res) => {
  validateObjectId(req.params.eventId, "ID aktivnosti");

  const { emoji } = req.body ?? {};
  if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
    throw new AppError(`Nevažeći emoji. Dozvoljeno: ${ALLOWED_EMOJIS.join(" ")}`, 400);
  }

  const reactions = await activityService.addReaction({
    userId: req.userId,
    eventId: req.params.eventId,
    emoji,
  });

  res.status(200).json({ status: "success", data: { reactions } });
});

exports.removeReaction = asyncHandler(async (req, res) => {
  validateObjectId(req.params.eventId, "ID aktivnosti");

  const reactions = await activityService.removeReaction({
    userId: req.userId,
    eventId: req.params.eventId,
  });

  res.status(200).json({ status: "success", data: { reactions } });
});
