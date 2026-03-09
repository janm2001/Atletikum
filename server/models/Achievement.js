const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  xpReward: { type: Number, required: true },
  xpCategory: {
    type: String,
    enum: ["brain", "body", "both"],
    default: "both",
  },
  category: {
    type: String,
    required: true,
    enum: ["milestone", "consistency", "performance", "special"],
  },
  trigger: {
    type: String,
    required: true,
    enum: [
      "workout_count",
      "quiz_count",
      "xp_threshold",
      "streak",
      "level",
      "perfect_quiz",
      "same_day_both",
    ],
  },
  threshold: { type: Number, required: true },
  badgeIcon: { type: String, default: "trophy" },
});

const Achievement = mongoose.model("Achievement", achievementSchema);

module.exports = { Achievement, achievementSchema };
