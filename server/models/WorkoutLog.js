const mongoose = require("mongoose");

const workoutLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workout",
    required: true,
  },
  workout: { type: String },
  requiredLevel: { type: Number, default: 1 },
  readinessScore: { type: Number, min: 1, max: 5, default: 3 },
  sessionFeedbackScore: { type: Number, min: 1, max: 5, default: 3 },
  completedExercises: [
    {
      exerciseId: { type: String, required: true },
      metricType: {
        type: String,
        enum: ["reps", "distance", "time"],
        default: "reps",
      },
      unitLabel: { type: String, default: "reps" },
      resultValue: { type: Number, min: 0 },
      loadKg: { type: Number, min: 0, default: null },
      weight: { type: Number, min: 0, default: null },
      reps: { type: Number, min: 0 },
      rpe: { type: Number, min: 1, max: 10 },
      isPersonalBest: { type: Boolean, default: false },
    },
  ],
  idempotencyKey: { type: String, unique: true, sparse: true },
  totalXpGained: { type: Number },
  date: { type: Date, default: Date.now },
});

workoutLogSchema.index({ user: 1, date: -1 });
workoutLogSchema.index({ user: 1, workoutId: 1, date: -1 });
workoutLogSchema.index({ user: 1, "completedExercises.exerciseId": 1 });

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);

module.exports = { workoutLogSchema, WorkoutLog };
