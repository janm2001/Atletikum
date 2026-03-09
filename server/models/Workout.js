const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  requiredLevel: { type: Number, default: 1 },
  exercises: [
    {
      exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
      sets: { type: Number, min: 1 },
      reps: String,
      rpe: String,
      baseXp: { type: Number, min: 0 },
    },
  ],
});

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = { workoutSchema, Workout };
