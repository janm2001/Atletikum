const { WorkoutLog } = require("../models/WorkoutLog");
const { User } = require("../models/User");

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

    const xpGain = Math.max(0, Number(totalXpGained) || 0);

    const newWorkoutLog = await WorkoutLog.create({
      user: req.user._id.toString(),
      workout,
      requiredLevel,
      completedExercises,
      totalXpGained: xpGain,
      date,
    });

    const updatedUser = await User.findById(req.user._id);

    if (updatedUser) {
      updatedUser.totalXp += xpGain;
      updatedUser.level = Math.max(
        1,
        Math.floor(updatedUser.totalXp / 300) + 1,
      );
      await updatedUser.save();
    }

    const safeUser = updatedUser
      ? {
          _id: updatedUser._id,
          username: updatedUser.username,
          trainingFrequency: updatedUser.trainingFrequency,
          focus: updatedUser.focus,
          level: updatedUser.level,
          totalXp: updatedUser.totalXp,
          dailyStreak: updatedUser.dailyStreak,
          role: updatedUser.role,
          profilePicture: updatedUser.profilePicture,
        }
      : null;

    res.status(201).json({
      status: "success",
      data: { workoutLog: newWorkoutLog, user: safeUser },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
