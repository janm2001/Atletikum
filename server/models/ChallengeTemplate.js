const mongoose = require("mongoose");

const challengeTemplateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["quiz", "workout", "reading", "custom"],
      required: true,
    },
    targetCount: {
      type: Number,
      required: true,
      min: 1,
    },
    xpReward: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 180,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    effectiveFromWeekStart: {
      type: Date,
      default: null,
    },
    effectiveToWeekStart: {
      type: Date,
      default: null,
    },
    version: {
      type: Number,
      default: 1,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

challengeTemplateSchema.index({ type: 1, effectiveFromWeekStart: 1 });
challengeTemplateSchema.index({ enabled: 1 });

const ChallengeTemplate = mongoose.model(
  "ChallengeTemplate",
  challengeTemplateSchema,
);

module.exports = { ChallengeTemplate };
