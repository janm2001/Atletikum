const express = require("express");
const gamificationController = require("../controllers/gamificationController");
const xpHistoryController = require("../controllers/xpHistoryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/gamification-status", gamificationController.getGamificationStatus);
router.get("/xp-history", xpHistoryController.getXpHistory);

module.exports = router;
