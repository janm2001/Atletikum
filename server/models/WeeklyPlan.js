const mongoose = require("mongoose");

const suggestedWorkoutSchema = new mongoose.Schema(
  {
    day: { type: Number, min: 1, max: 7, required: true },
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Workout" },
    reason: { type: String },
  },
  { _id: false }
);

const weeklyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    targetSessions: { type: Number, default: 3, min: 1, max: 7 },
    completedDays: [{ type: Number, min: 1, max: 7 }],
    suggestedWorkouts: [suggestedWorkoutSchema],
  },
  { timestamps: true }
);

weeklyPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

const WeeklyPlan = mongoose.model("WeeklyPlan", weeklyPlanSchema);

module.exports = { WeeklyPlan, weeklyPlanSchema };
