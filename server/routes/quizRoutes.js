const express = require("express");
const quizController = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  validateQuizStatusRequest,
  validateSubmitQuizRequest,
} = require("../validators/quizValidator");

const router = express.Router();

router.use(protect);

router.get("/my-completions", quizController.getMyCompletions);
router.get("/revision", quizController.getRevisionQuiz);
router.get(
  "/:articleId/status",
  validate(validateQuizStatusRequest),
  quizController.getQuizStatus,
);
router.post(
  "/:articleId/submit",
  validate(validateSubmitQuizRequest),
  quizController.submitQuiz,
);

module.exports = router;
