const { WorkoutLog } = require("../models/WorkoutLog");

exports.getMyWorkoutLogs = async (req, res) => {
  try {
    const workoutLogs = await WorkoutLog.find({
      user: req.user._id.toString(),
    }).sort({ date: -1 });

    res.status(200).json({
      status: "success",
      results: workoutLogs.length,
      data: { workoutLogs },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.createWorkoutLog = async (req, res) => {
  try {
    const { workout, requiredLevel, completedExercises, totalXpGained, date } =
      req.body;

    const newWorkoutLog = await WorkoutLog.create({
      user: req.user._id.toString(),
      workout,
      requiredLevel,
      completedExercises,
      totalXpGained,
      date,
    });

    res.status(201).json({
      status: "success",
      data: { workoutLog: newWorkoutLog },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
