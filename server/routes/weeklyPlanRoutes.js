const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const weeklyPlanController = require("../controllers/weeklyPlanController");
const { validateMarkDayCompleteRequest } = require("../validators/weeklyPlanValidator");

router.use(protect);

router.get("/", weeklyPlanController.getWeeklyPlan);
router.patch(
  "/progress",
  validate(validateMarkDayCompleteRequest),
  weeklyPlanController.markDayComplete,
);

module.exports = router;
