const express = require("express");
const exerciseController = require("../controllers/exerciseController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { exerciseMutationLimiter } = require("../middleware/rateLimiters");
const {
  validateExerciseIdRequest,
  validateCreateExerciseRequest,
  validateUpdateExerciseRequest,
} = require("../validators/exerciseValidator");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(exerciseController.getAllExercises)
  .post(
    restrictTo("admin"),
    exerciseMutationLimiter,
    validate(validateCreateExerciseRequest),
    exerciseController.createExercise,
  );

router
  .route("/:id")
  .get(exerciseController.getExerciseById)
  .patch(
    restrictTo("admin"),
    exerciseMutationLimiter,
    validate(validateUpdateExerciseRequest),
    exerciseController.updateExercise,
  )
  .delete(
    restrictTo("admin"),
    validate(validateExerciseIdRequest),
    exerciseController.deleteExercise,
  );

module.exports = router;
