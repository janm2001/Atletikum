const express = require("express");
const recommendationController = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/weekly", recommendationController.getWeeklyRecommendations);

module.exports = router;
