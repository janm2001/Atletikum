const asyncHandler = require("../middleware/asyncHandler");
const dailyMissionService = require("../services/dailyMissionService");

exports.getTodaysMissions = asyncHandler(async (req, res) => {
  const missions = await dailyMissionService.getOrCreateTodaysMissions({
    userId: req.userId,
  });

  res.status(200).json({
    status: "success",
    data: { missions },
  });
});

exports.trackLeaderboardVisit = asyncHandler(async (req, res) => {
  const missions = await dailyMissionService.incrementMissionProgress({
    userId: req.userId,
    missionType: "check_leaderboard",
  });

  res.status(200).json({
    status: "success",
    data: { missions },
  });
});

exports.trackArticleRead = asyncHandler(async (req, res) => {
  const missions = await dailyMissionService.incrementMissionProgress({
    userId: req.userId,
    missionType: "read_article",
  });

  res.status(200).json({
    status: "success",
    data: { missions },
  });
});
