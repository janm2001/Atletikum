const express = require("express");
const gamificationController = require("../controllers/gamificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/gamification-status", gamificationController.getGamificationStatus);

module.exports = router;
