const { WorkoutLog } = require("../models/WorkoutLog");
const { User } = require("../models/User");
const { Workout } = require("../models/Workout");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { checkAndUnlockAchievements } = require("../utils/achievementChecker");
const { updateDailyStreak } = require("../utils/updateDailyStreak");
const {
  normalizeCompletedExercise,
  calculateWorkoutXp,
  flagPersonalBests,
} = require("../utils/workoutMetrics");

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
    const {
      workoutId,
      completedExercises,
      readinessScore,
      sessionFeedbackScore,
    } = req.body;

    if (
      !workoutId ||
      !Array.isArray(completedExercises) ||
      completedExercises.length === 0
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Workout i odrađeni setovi su obavezni.",
      });
    }

    const workoutDoc = await Workout.findById(workoutId).lean();

    if (!workoutDoc) {
      return res.status(404).json({
        status: "fail",
        message: "Workout nije pronađen.",
      });
    }

    if ((req.user.level ?? 1) < (workoutDoc.requiredLevel ?? 1)) {
      return res.status(403).json({
        status: "fail",
        message: "Ovaj workout još nije otključan.",
      });
    }

    const workoutExercisesById = new Map(
      workoutDoc.exercises.map((exercise) => [
        String(exercise.exerciseId),
        exercise,
      ]),
    );

    const normalizedExercises = completedExercises.map((exercise) => {
      const workoutExercise = workoutExercisesById.get(
        String(exercise.exerciseId),
      );

      if (!workoutExercise) {
        throw new Error("Workout sadrži nevažeću vježbu u logu.");
      }

      return normalizeCompletedExercise(exercise, workoutExercise);
    });

    const previousLogs = await WorkoutLog.find({
      user: req.user._id.toString(),
      "completedExercises.exerciseId": {
        $in: normalizedExercises.map((exercise) => exercise.exerciseId),
      },
    })
      .select("completedExercises")
      .lean();

    const previousExercises = previousLogs.flatMap(
      (log) => log.completedExercises ?? [],
    );
    const completedWithPersonalBests = flagPersonalBests(
      normalizedExercises,
      previousExercises,
    );

    const xpGain = calculateWorkoutXp(workoutDoc, completedWithPersonalBests);

    const newWorkoutLog = await WorkoutLog.create({
      user: req.user._id.toString(),
      workoutId: workoutDoc._id,
      workout: workoutDoc.title,
      requiredLevel: workoutDoc.requiredLevel,
      readinessScore: Number(readinessScore ?? 3),
      sessionFeedbackScore: Number(sessionFeedbackScore ?? 3),
      completedExercises: completedWithPersonalBests,
      totalXpGained: xpGain,
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
        personalBests: completedWithPersonalBests.filter(
          (exercise) => exercise.isPersonalBest,
        ),
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
