const express = require("express");
const leaderboardController = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", leaderboardController.getLeaderboard);

module.exports = router;
