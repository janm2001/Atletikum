const express = require("express");
const exerciseController = require("../controllers/exerciseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(exerciseController.getAllExercises)
  .post(exerciseController.createExercise);

router
  .route("/:id")
  .get(exerciseController.getExerciseById)
  .patch(exerciseController.updateExercise)
  .delete(exerciseController.deleteExercise);

module.exports = router;
