const asyncHandler = require("../middleware/asyncHandler");
const weeklyChallengeService = require("../services/weeklyChallengeService");

exports.getWeeklyChallenges = asyncHandler(async (req, res) => {
  const challenges = await weeklyChallengeService.getUserChallengeStatus({
    userId: req.userId,
    now: new Date(),
  });

  res.status(200).json({
    status: "success",
    data: { challenges },
  });
});

exports.claimChallengeReward = asyncHandler(async (req, res) => {
  const result = await weeklyChallengeService.claimChallengeReward({
    userId: req.userId,
    challengeId: req.params.challengeId,
  });

  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.getChallengeHistory = asyncHandler(async (req, res) => {
  const result = await weeklyChallengeService.getChallengeHistory({
    userId: req.userId,
    limit: req.query.limit,
    cursorWeekStart: req.query.cursorWeekStart,
  });

  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.getWeeklyLeaderboard = asyncHandler(async (req, res) => {
  const result = await weeklyChallengeService.getWeeklyLeaderboard({
    userId: req.userId,
    weekStart: req.query.weekStart,
    limit: req.query.limit,
  });

  res.status(200).json({
    status: "success",
    data: result,
  });
});
