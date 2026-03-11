const express = require("express");
const workoutLogController = require("../controllers/workoutLogController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  validateCreateWorkoutLogRequest,
} = require("../validators/workoutLogValidator");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(workoutLogController.getMyWorkoutLogs)
  .post(
    validate(validateCreateWorkoutLogRequest),
    workoutLogController.createWorkoutLog,
  );

module.exports = router;
