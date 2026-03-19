const express = require("express");
const workoutLogController = require("../controllers/workoutLogController");
const { protect } = require("../middleware/authMiddleware");
const { workoutLogCreationLimiter } = require("../middleware/rateLimiters");
const validate = require("../middleware/validate");
const {
  validateCreateWorkoutLogRequest,
  validateGetLatestWorkoutLogRequest,
} = require("../validators/workoutLogValidator");

const router = express.Router();

router.use(protect);

router.get(
  "/latest/:workoutId",
  validate(validateGetLatestWorkoutLogRequest),
  workoutLogController.getLatestWorkoutLog,
);

router
  .route("/")
  .get(workoutLogController.getMyWorkoutLogs)
  .post(
    workoutLogCreationLimiter,
    validate(validateCreateWorkoutLogRequest),
    workoutLogController.createWorkoutLog,
  );

module.exports = router;
