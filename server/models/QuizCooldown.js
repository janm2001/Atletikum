const mongoose = require("mongoose");

const quizCooldownSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    nextAvailableAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

quizCooldownSchema.index({ user: 1, article: 1 }, { unique: true });

const QuizCooldown = mongoose.model("QuizCooldown", quizCooldownSchema);

module.exports = {
  QuizCooldown,
  quizCooldownSchema,
};
