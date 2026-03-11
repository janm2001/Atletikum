const mongoose = require("mongoose");

const exerciseProgressionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
      index: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
      index: true,
    },
    currentTargetKg: {
      type: Number,
      min: 0,
      required: true,
    },
    incrementKg: {
      type: Number,
      min: 0,
      default: 2.5,
    },
    lastSuccessfulLoadKg: {
      type: Number,
      min: 0,
      default: null,
    },
    lastCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

exerciseProgressionSchema.index(
  { userId: 1, workoutId: 1, exerciseId: 1 },
  { unique: true },
);

const ExerciseProgression = mongoose.model(
  "ExerciseProgression",
  exerciseProgressionSchema,
);

module.exports = { exerciseProgressionSchema, ExerciseProgression };
