const { WorkoutLog } = require("../models/WorkoutLog");
const { User } = require("../models/User");
const { Workout } = require("../models/Workout");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { checkAndUnlockAchievements } = require("../utils/achievementChecker");
const { updateDailyStreak } = require("../utils/updateDailyStreak");

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
    const { workout, requiredLevel, completedExercises, date } = req.body;

    // --- Compute XP server-side from workout data ---
    const workoutDoc = await Workout.findOne({ title: workout });
    const xpGain = workoutDoc
      ? workoutDoc.exercises.reduce((sum, ex) => sum + (ex.baseXp || 0), 0)
      : 0;

    const newWorkoutLog = await WorkoutLog.create({
      user: req.user._id.toString(),
      workout,
      requiredLevel,
      completedExercises,
      totalXpGained: xpGain,
      date,
    });

    // --- Update user XP (body category) ---
    const updatedUser = await User.findById(req.user._id);

    if (updatedUser) {
      updatedUser.bodyXp += xpGain;
      updatedUser.totalXp = updatedUser.brainXp + updatedUser.bodyXp;
      updatedUser.level = getLevelFromTotalXp(updatedUser.totalXp);
      await updatedUser.save();
    }

    await updateDailyStreak(req.user._id);

    const newAchievements = await checkAndUnlockAchievements(
      req.user._id.toString(),
    );

    const freshUser = await User.findById(req.user._id);

    res.status(201).json({
      status: "success",
      data: {
        workoutLog: newWorkoutLog,
        user: sanitizeUser(freshUser),
        newAchievements,
        totalXpGained: xpGain,
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
