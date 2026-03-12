const asyncHandler = require("../middleware/asyncHandler");
const quizService = require("../services/quizService");

exports.getQuizStatus = asyncHandler(async (req, res) => {
  const quizStatus = await quizService.getQuizStatus({
    userId: req.userId,
    articleId: req.params.articleId,
  });

  res.status(200).json(quizStatus);
});

exports.submitQuiz = asyncHandler(async (req, res) => {
  const result = await quizService.submitQuiz({
    userId: req.userId,
    articleId: req.params.articleId,
    submittedAnswers: req.body.submittedAnswers,
  });

  res.status(201).json({
    status: "success",
    data: result,
  });
});

exports.getMyCompletions = asyncHandler(async (req, res) => {
  const completions = await quizService.getMyCompletions({
    userId: req.userId,
  });

  res.status(200).json({
    status: "success",
    data: completions,
  });
});

exports.getRevisionQuiz = asyncHandler(async (req, res) => {
  const revision = await quizService.getRevisionQuiz({
    userId: req.userId,
  });

  res.status(200).json({
    status: "success",
    data: { revision },
  });
});
