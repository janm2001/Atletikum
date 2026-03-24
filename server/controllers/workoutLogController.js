const asyncHandler = require("../middleware/asyncHandler");
const workoutLogService = require("../services/workoutLogService");

exports.getMyWorkoutLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;

  const result = await workoutLogService.getMyWorkoutLogs({
    userId: req.userId,
    page,
    limit,
  });

  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.getLatestWorkoutLog = asyncHandler(async (req, res) => {
  const workoutLog = await workoutLogService.getLatestWorkoutLog({
    userId: req.userId,
    workoutId: req.params.workoutId,
  });

  if (!workoutLog) {
    return res.status(204).send();
  }

  return res.status(200).json({
    status: "success",
    data: { workoutLog },
  });
});

exports.createWorkoutLog = asyncHandler(async (req, res) => {
  const result = await workoutLogService.createWorkoutLog({
    user: req.user,
    userId: req.userId,
    payload: req.body,
    idempotencyKey: req.headers["x-idempotency-key"],
  });

  res.status(201).json({
    status: "success",
    data: result,
  });
});
