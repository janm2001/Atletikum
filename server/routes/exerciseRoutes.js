const express = require("express");
const exerciseController = require("../controllers/exerciseController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(exerciseController.getAllExercises)
  .post(restrictTo("admin"), exerciseController.createExercise);

router
  .route("/:id")
  .get(exerciseController.getExerciseById)
  .patch(restrictTo("admin"), exerciseController.updateExercise)
  .delete(restrictTo("admin"), exerciseController.deleteExercise);

module.exports = router;
