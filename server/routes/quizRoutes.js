const express = require("express");
const quizController = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/my-completions", quizController.getMyCompletions);
router.get("/revision", quizController.getRevisionQuiz);
router.get("/:articleId/status", quizController.getQuizStatus);
router.post("/:articleId/submit", quizController.submitQuiz);

module.exports = router;
