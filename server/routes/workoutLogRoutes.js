const express = require("express");
const workoutLogController = require("../controllers/workoutLogController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(workoutLogController.getMyWorkoutLogs)
  .post(workoutLogController.createWorkoutLog);

module.exports = router;
