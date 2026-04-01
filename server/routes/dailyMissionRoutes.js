const express = require("express");
const dailyMissionController = require("../controllers/dailyMissionController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  validateTrackLeaderboard,
  validateTrackArticleRead,
} = require("../validators/dailyMissionValidator");

const router = express.Router();

router.use(protect);

router.get("/today", dailyMissionController.getTodaysMissions);
router.post(
  "/track/leaderboard",
  validate(validateTrackLeaderboard),
  dailyMissionController.trackLeaderboardVisit,
);
router.post(
  "/track/article",
  validate(validateTrackArticleRead),
  dailyMissionController.trackArticleRead,
);

module.exports = router;
