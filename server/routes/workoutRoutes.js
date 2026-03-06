const express = require("express");
const workoutController = require("../controllers/workoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(workoutController.getAllWorkouts)
  .post(workoutController.createWorkout);

router
  .route("/:id")
  .get(workoutController.getWorkoutById)
  .patch(workoutController.updateWorkout)
  .delete(workoutController.deleteWorkout);

module.exports = router;
