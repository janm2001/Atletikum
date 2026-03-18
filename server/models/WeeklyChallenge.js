const mongoose = require("mongoose");

const weeklyChallengeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["quiz", "workout", "reading"],
      required: true,
    },
    targetCount: {
      type: Number,
      required: true,
    },
    xpReward: {
      type: Number,
      required: true,
    },
    weekStart: {
      type: Date,
      required: true,
    },
    weekEnd: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

weeklyChallengeSchema.index({ weekStart: -1 });
weeklyChallengeSchema.index({ type: 1, weekStart: 1 }, { unique: true });

const WeeklyChallenge = mongoose.model("WeeklyChallenge", weeklyChallengeSchema);

module.exports = { WeeklyChallenge };
