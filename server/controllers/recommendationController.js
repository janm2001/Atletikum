const asyncHandler = require("../middleware/asyncHandler");
const recommendationService = require("../services/recommendationService");

exports.getWeeklyRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await recommendationService.getWeeklyRecommendations({
    user: req.user,
  });

  res.status(200).json({
    status: "success",
    data: recommendations,
  });
});
