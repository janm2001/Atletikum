const express = require("express");
const workoutController = require("../controllers/workoutController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { workoutMutationLimiter } = require("../middleware/rateLimiters");
const {
  validateCreateWorkoutRequest,
  validateUpdateWorkoutRequest,
} = require("../validators/workoutValidator");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(workoutController.getAllWorkouts)
  .post(
    restrictTo("admin"),
    workoutMutationLimiter,
    validateCreateWorkoutRequest,
    workoutController.createWorkout,
  );

router.post(
  "/custom",
  workoutMutationLimiter,
  validateCreateWorkoutRequest,
  workoutController.createCustomWorkout,
);

router
  .route("/:id")
  .get(workoutController.getWorkoutById)
  .patch(
    workoutMutationLimiter,
    validateUpdateWorkoutRequest,
    workoutController.updateWorkout,
  )
  .delete(workoutController.deleteWorkout);

module.exports = router;
