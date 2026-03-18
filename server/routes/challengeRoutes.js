const express = require("express");
const challengeController = require("../controllers/challengeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/weekly", challengeController.getWeeklyChallenges);
router.post("/weekly/:challengeId/claim", challengeController.claimChallengeReward);

module.exports = router;
