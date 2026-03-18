const express = require("express");
const challengeController = require("../controllers/challengeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/weekly", challengeController.getWeeklyChallenges);
router.post("/weekly/:challengeId/claim", challengeController.claimChallengeReward);
router.get("/history", challengeController.getChallengeHistory);
router.get("/leaderboard/weekly", challengeController.getWeeklyLeaderboard);

module.exports = router;
