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
    cooldownLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    lastScore: {
      type: Number,
      default: null,
    },
    lastPassed: {
      type: Boolean,
      default: null,
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
