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
