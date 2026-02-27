const { Exercise } = require("../models/Exercise");

exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: exercises.length,
      data: { exercises },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res
        .status(404)
        .json({ status: "fail", message: "Exercise not found" });
    }

    res.status(200).json({ status: "success", data: { exercise } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.createExercise = async (req, res) => {
  try {
    const newExercise = await Exercise.create(req.body);

    res
      .status(201)
      .json({ status: "success", data: { exercise: newExercise } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateExercise = async (req, res) => {
  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedExercise) {
      return res
        .status(404)
        .json({ status: "fail", message: "Exercise not found" });
    }

    res
      .status(200)
      .json({ status: "success", data: { exercise: updatedExercise } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const deletedExercise = await Exercise.findByIdAndDelete(req.params.id);

    if (!deletedExercise) {
      return res
        .status(404)
        .json({ status: "fail", message: "Exercise not found" });
    }

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
