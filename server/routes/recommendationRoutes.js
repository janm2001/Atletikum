const express = require("express");
const recommendationController = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");
const { recommendationLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.use(protect);

router.get(
  "/weekly",
  recommendationLimiter,
  recommendationController.getWeeklyRecommendations,
);

module.exports = router;
