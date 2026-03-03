const mongoose = require("mongoose");

const workoutLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  workout: { type: String },
  requiredLevel: { type: Number, default: 1 },
  completedExercises: [
    {
      exerciseId: String,
      weight: Number,
      reps: Number,
      rpe: Number,
    },
  ],
  totalXpGained: { type: Number },
  date: { type: Date, default: Date.now },
});

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);

module.exports = { workoutLogSchema, WorkoutLog };
