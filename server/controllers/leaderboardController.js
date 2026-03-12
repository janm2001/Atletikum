const asyncHandler = require("../middleware/asyncHandler");
const leaderboardService = require("../services/leaderboardService");

exports.getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboardData = await leaderboardService.getLeaderboard({
    currentUser: req.user,
    currentUserId: req.userId,
  });

  res.status(200).json({
    status: "success",
    data: leaderboardData,
  });
});
