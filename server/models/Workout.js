const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  requiredLevel: { type: Number, default: 1 },
  exercises: [
    {
      exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
      sets: Number,
      reps: String,
      rpe: String,
      baseXp: Number,
    },
  ],
});

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = { workoutSchema, Workout };
