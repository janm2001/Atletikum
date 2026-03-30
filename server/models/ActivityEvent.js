const mongoose = require("mongoose");

const ACTIVITY_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

const ALLOWED_EMOJIS = ["💪", "🔥", "🏆", "👏", "🎉"];

const ACTIVITY_TYPES = [
  "level_up",
  "achievement_unlocked",
  "personal_best",
  "workout_completed",
  "streak_milestone",
  "quiz_aced",
];

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      enum: ALLOWED_EMOJIS,
    },
  },
  { _id: false },
);

const activityEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ACTIVITY_TYPES,
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    reactions: { type: [reactionSchema], default: [] },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

activityEventSchema.index({ user: 1, createdAt: -1 });
activityEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: ACTIVITY_TTL_SECONDS });

const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema);

module.exports = { ActivityEvent, ACTIVITY_TYPES, ALLOWED_EMOJIS };
