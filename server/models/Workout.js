const mongoose = require("mongoose");

const progressionConfigSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    initialWeightKg: { type: Number, min: 0, default: null },
    incrementKg: { type: Number, min: 0, default: 2.5 },
  },
  { _id: false },
);

const workoutExerciseSchema = new mongoose.Schema(
  {
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
    sets: { type: Number, min: 1 },
    reps: String,
    rpe: String,
    baseXp: { type: Number, min: 0 },
    progression: {
      type: progressionConfigSchema,
      default: () => ({
        enabled: false,
        initialWeightKg: null,
        incrementKg: 2.5,
      }),
    },
    restSeconds: { type: Number, min: 0, max: 600, default: null },
  },
  { _id: false },
);

const workoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  requiredLevel: { type: Number, default: 1 },
  tags: [{ type: String, trim: true }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  exercises: [workoutExerciseSchema],
});

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = {
  progressionConfigSchema,
  workoutExerciseSchema,
  workoutSchema,
  Workout,
};
