const express = require("express");
const gamificationController = require("../controllers/gamificationController");
const xpHistoryController = require("../controllers/xpHistoryController");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/me", userController.getMe);
router.get("/gamification-status", gamificationController.getGamificationStatus);
router.get("/xp-history", xpHistoryController.getXpHistory);

module.exports = router;
