const express = require("express");
const dailyMissionController = require("../controllers/dailyMissionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/today", dailyMissionController.getTodaysMissions);
router.post("/track/leaderboard", dailyMissionController.trackLeaderboardVisit);
router.post("/track/article", dailyMissionController.trackArticleRead);

module.exports = router;
