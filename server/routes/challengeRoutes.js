const express = require("express");
const challengeController = require("../controllers/challengeController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { validateClaimChallengeRewardRequest } = require("../validators/challengeValidator");

const router = express.Router();

router.use(protect);

router.get("/weekly", challengeController.getWeeklyChallenges);
router.post(
  "/weekly/:challengeId/claim",
  validate(validateClaimChallengeRewardRequest),
  challengeController.claimChallengeReward,
);
router.get("/history", challengeController.getChallengeHistory);
router.get("/leaderboard/weekly", challengeController.getWeeklyLeaderboard);

module.exports = router;
