const AppError = require("../utils/AppError");
const { Exercise } = require("../models/Exercise");

const getAllExercises = async () => {
  return Exercise.find().sort({ createdAt: -1 });
};

const getExerciseById = async (exerciseId) => {
  const exercise = await Exercise.findById(exerciseId);

  if (!exercise) {
    throw new AppError("Exercise not found", 404);
  }

  return exercise;
};

const createExercise = async (payload) => {
  return Exercise.create(payload);
};

const updateExercise = async (exerciseId, payload) => {
  const exercise = await Exercise.findByIdAndUpdate(exerciseId, payload, {
    new: true,
    runValidators: true,
  });

  if (!exercise) {
    throw new AppError("Exercise not found", 404);
  }

  return exercise;
};

const deleteExercise = async (exerciseId) => {
  const exercise = await Exercise.findByIdAndDelete(exerciseId);

  if (!exercise) {
    throw new AppError("Exercise not found", 404);
  }
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
