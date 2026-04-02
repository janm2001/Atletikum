const { Exercise } = require("../models/Exercise");
const { ensureResourceExists } = require("../utils/serviceGuards");

const getAllExercises = async () => {
  return Exercise.find().sort({ createdAt: -1 }).lean();
};

const getExerciseById = async (exerciseId) => {
  return ensureResourceExists(
    await Exercise.findById(exerciseId).lean(),
    "Exercise not found",
  );
};

const createExercise = async (payload) => {
  return Exercise.create(payload);
};

const updateExercise = async (exerciseId, payload) => {
  return ensureResourceExists(
    await Exercise.findByIdAndUpdate(exerciseId, payload, {
      returnDocument: "after",
      runValidators: true,
    }),
    "Exercise not found",
  );
};

const deleteExercise = async (exerciseId) => {
  ensureResourceExists(
    await Exercise.findByIdAndDelete(exerciseId),
    "Exercise not found",
  );
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
