const mongoose = require("mongoose");

const MISSION_TYPES = [
  "log_workout",
  "complete_quiz",
  "read_article",
  "check_leaderboard",
];

const missionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: MISSION_TYPES,
    },
    target: { type: Number, required: true, default: 1 },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    xpReward: { type: Number, required: true },
  },
  { _id: true },
);

const dailyMissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    missions: { type: [missionSchema], default: [] },
    bonusClaimed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

dailyMissionSchema.index({ user: 1, date: 1 }, { unique: true });

const DailyMission = mongoose.model("DailyMission", dailyMissionSchema);

module.exports = { DailyMission, MISSION_TYPES };
