const express = require("express");
const exerciseController = require("../controllers/exerciseController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { exerciseMutationLimiter } = require("../middleware/rateLimiters");
const {
  validateCreateExerciseRequest,
  validateUpdateExerciseRequest,
} = require("../validators/exerciseValidator");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(exerciseController.getAllExercises)
  .post(
    restrictTo("admin"),
    exerciseMutationLimiter,
    validateCreateExerciseRequest,
    exerciseController.createExercise,
  );

router
  .route("/:id")
  .get(exerciseController.getExerciseById)
  .patch(
    restrictTo("admin"),
    exerciseMutationLimiter,
    validateUpdateExerciseRequest,
    exerciseController.updateExercise,
  )
  .delete(restrictTo("admin"), exerciseController.deleteExercise);

module.exports = router;
