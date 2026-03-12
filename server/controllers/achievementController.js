const asyncHandler = require("../middleware/asyncHandler");
const achievementService = require("../services/achievementService");

exports.getMyAchievements = asyncHandler(async (req, res) => {
  const achievements = await achievementService.getMyAchievements({
    userId: req.userId,
  });

  res.status(200).json({
    status: "success",
    results: achievements.length,
    data: { achievements },
  });
});
