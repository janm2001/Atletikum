const asyncHandler = require("../middleware/asyncHandler");
const workoutService = require("../services/workoutService");

exports.getAllWorkouts = asyncHandler(async (request, response) => {
  const workouts = await workoutService.getAllWorkouts();

  response.status(200).json({
    status: "success",
    results: workouts.length,
    data: { workouts },
  });
});

exports.getWorkoutById = asyncHandler(async (request, response) => {
  const workout = await workoutService.getWorkoutById(request.params.id);
  response.status(200).json(workout);
});

exports.createWorkout = asyncHandler(async (req, res) => {
  const newWorkout = await workoutService.createWorkout(req.body);
  res.status(201).json(newWorkout);
});

exports.updateWorkout = asyncHandler(async (req, res) => {
  const updatedWorkout = await workoutService.updateWorkout(
    req.params.id,
    req.body,
  );
  res.status(200).json(updatedWorkout);
});

exports.deleteWorkout = asyncHandler(async (req, res) => {
  await workoutService.deleteWorkout(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
