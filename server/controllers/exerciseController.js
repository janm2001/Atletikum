const asyncHandler = require("../middleware/asyncHandler");
const exerciseService = require("../services/exerciseService");

exports.getAllExercises = asyncHandler(async (req, res) => {
  const exercises = await exerciseService.getAllExercises();

  res.status(200).json({
    status: "success",
    results: exercises.length,
    data: { exercises },
  });
});

exports.getExerciseById = asyncHandler(async (req, res) => {
  const exercise = await exerciseService.getExerciseById(req.params.id);

  res.status(200).json({ status: "success", data: { exercise } });
});

exports.createExercise = asyncHandler(async (req, res) => {
  const newExercise = await exerciseService.createExercise(req.body);

  res.status(201).json({ status: "success", data: { exercise: newExercise } });
});

exports.updateExercise = asyncHandler(async (req, res) => {
  const updatedExercise = await exerciseService.updateExercise(
    req.params.id,
    req.body,
  );

  res
    .status(200)
    .json({ status: "success", data: { exercise: updatedExercise } });
});

exports.deleteExercise = asyncHandler(async (req, res) => {
  await exerciseService.deleteExercise(req.params.id);

  res.status(204).json({ status: "success", data: null });
});
