const { WorkoutLog } = require("../models/WorkoutLog");
const { Workout } = require("../models/Workout");
const AppError = require("../utils/AppError");
const {
  normalizeCompletedExercise,
  calculateWorkoutXp,
  flagPersonalBests,
} = require("../utils/workoutMetrics");
const { applyUserProgress } = require("./userProgressService");

const getMyWorkoutLogs = async ({ userId }) => {
  return WorkoutLog.find({ user: userId }).sort({ date: -1 });
};

const createWorkoutLog = async ({ user, payload }) => {
  const {
    workoutId,
    completedExercises,
    readinessScore,
    sessionFeedbackScore,
  } = payload;

  const workoutDoc = await Workout.findById(workoutId).lean();
  if (!workoutDoc) {
    throw new AppError("Workout nije pronađen.", 404);
  }

  if ((user.level ?? 1) < (workoutDoc.requiredLevel ?? 1)) {
    throw new AppError("Ovaj workout još nije otključan.", 403);
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
      throw new AppError("Workout sadrži nevažeću vježbu u logu.", 400);
    }

    return normalizeCompletedExercise(exercise, workoutExercise);
  });

  const previousLogs = await WorkoutLog.find({
    user: user._id.toString(),
    "completedExercises.exerciseId": {
      $in: normalizedExercises.map((exercise) => exercise.exerciseId),
    },
  })
    .select("completedExercises")
    .lean();

  const previousExercises = previousLogs.flatMap(
    (workoutLog) => workoutLog.completedExercises ?? [],
  );
  const completedWithPersonalBests = flagPersonalBests(
    normalizedExercises,
    previousExercises,
  );

  const xpGain = calculateWorkoutXp(workoutDoc, completedWithPersonalBests);

  const workoutLog = await WorkoutLog.create({
    user: user._id.toString(),
    workoutId: workoutDoc._id,
    workout: workoutDoc.title,
    requiredLevel: workoutDoc.requiredLevel,
    readinessScore: Number(readinessScore ?? 3),
    sessionFeedbackScore: Number(sessionFeedbackScore ?? 3),
    completedExercises: completedWithPersonalBests,
    totalXpGained: xpGain,
  });

  const progress = await applyUserProgress({
    userId: user._id,
    bodyXp: xpGain,
    shouldUpdateStreak: true,
    shouldUnlockAchievements: true,
  });

  return {
    workoutLog,
    user: progress.user,
    newAchievements: progress.newAchievements,
    totalXpGained: xpGain,
    personalBests: completedWithPersonalBests.filter(
      (exercise) => exercise.isPersonalBest,
    ),
  };
};

module.exports = {
  getMyWorkoutLogs,
  createWorkoutLog,
};
