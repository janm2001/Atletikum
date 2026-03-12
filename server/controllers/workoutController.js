const asyncHandler = require("../middleware/asyncHandler");
const workoutService = require("../services/workoutService");

exports.getAllWorkouts = asyncHandler(async (request, response) => {
  const workouts = await workoutService.getAllWorkouts({
    user: request.user,
    userId: request.userId,
    scope: request.query.scope,
  });

  response.status(200).json({
    status: "success",
    results: workouts.length,
    data: { workouts },
  });
});

exports.getWorkoutById = asyncHandler(async (request, response) => {
  const workout = await workoutService.getWorkoutById({
    workoutId: request.params.id,
    user: request.user,
    userId: request.userId,
  });
  response.status(200).json(workout);
});

exports.createWorkout = asyncHandler(async (req, res) => {
  const newWorkout = await workoutService.createWorkout({
    payload: req.body,
    createdBy: null,
  });
  res.status(201).json(newWorkout);
});

exports.createCustomWorkout = asyncHandler(async (req, res) => {
  const newWorkout = await workoutService.createWorkout({
    payload: req.body,
    createdBy: req.userId,
  });
  res.status(201).json(newWorkout);
});

exports.updateWorkout = asyncHandler(async (req, res) => {
  const updatedWorkout = await workoutService.updateWorkout({
    workoutId: req.params.id,
    payload: req.body,
    user: req.user,
    userId: req.userId,
  });
  res.status(200).json(updatedWorkout);
});

exports.deleteWorkout = asyncHandler(async (req, res) => {
  await workoutService.deleteWorkout({
    workoutId: req.params.id,
    user: req.user,
    userId: req.userId,
  });
  res.status(204).json({ status: "success", data: null });
});
