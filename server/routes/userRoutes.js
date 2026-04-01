const express = require("express");
const gamificationController = require("../controllers/gamificationController");
const xpHistoryController = require("../controllers/xpHistoryController");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { validateGetXpHistoryRequest } = require("../validators/userValidator");

const router = express.Router();

router.use(protect);

router.get("/me", userController.getMe);
router.get(
  "/gamification-status",
  gamificationController.getGamificationStatus,
);
router.get(
  "/xp-history",
  validate(validateGetXpHistoryRequest),
  xpHistoryController.getXpHistory,
);

module.exports = router;
