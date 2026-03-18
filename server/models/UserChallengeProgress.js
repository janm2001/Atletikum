const mongoose = require("mongoose");

const userChallengeProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyChallenge",
      required: true,
    },
    currentCount: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    xpAwarded: {
      type: Boolean,
      default: false,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    bonusAwarded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
userChallengeProgressSchema.index({ userId: 1, completed: 1 });

const UserChallengeProgress = mongoose.model(
  "UserChallengeProgress",
  userChallengeProgressSchema,
);

module.exports = { UserChallengeProgress };
