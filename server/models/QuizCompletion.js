const mongoose = require("mongoose");

const quizCompletionSchema = new mongoose.Schema({
  user: { type: String, required: true },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: true,
  },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  xpGained: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  submittedAnswers: [{ type: Number, min: 0 }],
  completedAt: { type: Date, default: Date.now },
});

quizCompletionSchema.index({ user: 1, article: 1 });

const QuizCompletion = mongoose.model("QuizCompletion", quizCompletionSchema);

module.exports = { QuizCompletion, quizCompletionSchema };
