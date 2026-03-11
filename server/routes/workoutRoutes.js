const express = require("express");
const workoutController = require("../controllers/workoutController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(workoutController.getAllWorkouts)
  .post(restrictTo("admin"), workoutController.createWorkout);

router.post("/custom", workoutController.createCustomWorkout);

router
  .route("/:id")
  .get(workoutController.getWorkoutById)
  .patch(workoutController.updateWorkout)
  .delete(workoutController.deleteWorkout);

module.exports = router;
