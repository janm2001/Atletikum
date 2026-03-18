const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/gamification", analyticsController.getGamificationKpis);

module.exports = router;
