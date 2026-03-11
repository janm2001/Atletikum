const AppError = require("../utils/AppError");
const { Workout } = require("../models/Workout");

const workoutListPopulate = ["exercises.exerciseId", "title imageLink"];

const getAllWorkouts = async () => {
  return Workout.find().populate(...workoutListPopulate);
};

const getWorkoutById = async (workoutId) => {
  const workout = await Workout.findById(workoutId).populate(
    ...workoutListPopulate,
  );

  if (!workout) {
    throw new AppError("Workout not found", 404);
  }

  return workout;
};

const createWorkout = async (payload) => {
  return Workout.create(payload);
};

const updateWorkout = async (workoutId, payload) => {
  const workout = await Workout.findByIdAndUpdate(workoutId, payload, {
    new: true,
    runValidators: true,
  });

  if (!workout) {
    throw new AppError("Workout not found", 404);
  }

  return workout;
};

const deleteWorkout = async (workoutId) => {
  const workout = await Workout.findByIdAndDelete(workoutId);

  if (!workout) {
    throw new AppError("Workout not found", 404);
  }
};

module.exports = {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};
