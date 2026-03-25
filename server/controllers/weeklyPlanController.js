const asyncHandler = require("../middleware/asyncHandler");
const weeklyPlanService = require("../services/weeklyPlanService");

exports.getWeeklyPlan = asyncHandler(async (req, res) => {
  const progress = await weeklyPlanService.getCurrentWeekProgress({
    userId: req.userId,
    user: req.user,
  });

  res.status(200).json({
    status: "success",
    data: progress,
  });
});

exports.markDayComplete = asyncHandler(async (req, res) => {
  const { day } = req.body;

  await weeklyPlanService.markDayComplete({
    userId: req.userId,
    day: Number(day),
  });

  const progress = await weeklyPlanService.getCurrentWeekProgress({
    userId: req.userId,
    user: req.user,
  });

  res.status(200).json({
    status: "success",
    data: progress,
  });
});
