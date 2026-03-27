const { WorkoutLog } = require("../models/WorkoutLog");
const { Workout } = require("../models/Workout");
const AppError = require("../utils/AppError");
const {
  normalizeCompletedExercise,
  calculateWorkoutXp,
  flagPersonalBests,
} = require("../utils/workoutMetrics");
const {
  attachSession,
  createWithSession,
  runInTransaction,
} = require("../utils/mongoTransaction");
const { requireUserId } = require("../utils/userIdentity");
const { applyUserProgress } = require("./userProgressService");
const { syncWorkoutProgressions } = require("./progressionService");
const { updateChallengeProgress } = require("./weeklyChallengeService");
const { markDayComplete } = require("./weeklyPlanService");
const {
  checkDailyLimitReached,
  getNextAvailableDaySlot,
} = require("./dailyLimitService");
const { getIsoWeekDay } = require("../utils/dateUtils");

const DUPLICATE_WINDOW_MS = 60 * 1000;

const getMyWorkoutLogs = async ({ userId, user, page = 1, limit = 30 }) => {
  const normalizedUserId = requireUserId({ userId, user });

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    WorkoutLog.find({ user: normalizedUserId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WorkoutLog.countDocuments({ user: normalizedUserId }),
  ]);

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const getLatestWorkoutLog = async ({ userId, user, workoutId }) => {
  const normalizedUserId = requireUserId({ userId, user });

  return WorkoutLog.findOne({
    user: normalizedUserId,
    workoutId,
  })
    .sort({ date: -1 })
    .lean();
};

const createWorkoutLog = async ({ user, userId, payload, idempotencyKey }) => {
  const normalizedUserId = requireUserId({ userId, user });
  const { workoutId, completedExercises } = payload;

  return runInTransaction(async (session) => {
    const workoutDoc = await attachSession(
      Workout.findById(workoutId).lean(),
      session,
    );
    if (!workoutDoc) {
      throw new AppError("Workout nije pronađen.", 404);
    }

    if (idempotencyKey) {
      const existingLog = await attachSession(
        WorkoutLog.findOne({ idempotencyKey, user: normalizedUserId }).lean(),
        session,
      );
      if (existingLog) {
        return {
          workoutLog: existingLog,
          user: null,
          newAchievements: [],
          totalXpGained: existingLog.totalXpGained ?? 0,
          personalBests: (existingLog.completedExercises ?? []).filter(
            (exercise) => exercise.isPersonalBest,
          ),
        };
      }
    }

    const duplicateLog = await attachSession(
      WorkoutLog.exists({
        user: normalizedUserId,
        workoutId: workoutDoc._id,
        date: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      }),
      session,
    );
    if (duplicateLog) {
      throw new AppError(
        "Trening je već spremljen. Pričekajte prije ponovnog spremanja.",
        409,
      );
    }

    const dailyLimitReached = await checkDailyLimitReached({
      userId: normalizedUserId,
      session,
    });
    if (dailyLimitReached) {
      throw new AppError(
        "Dosegnuli ste dnevni limit treninga. Nastavite sutra!",
        429,
      );
    }

    const daySlot = await getNextAvailableDaySlot({
      userId: normalizedUserId,
      session,
    });

    const createdBy = workoutDoc.createdBy ? String(workoutDoc.createdBy) : null;
    const isGlobal = createdBy === null;
    const isOwner = createdBy === normalizedUserId;
    const isAdmin = user.role === "admin";

    if (!isGlobal && !isOwner && !isAdmin) {
      throw new AppError("Workout nije pronađen.", 404);
    }

    if (isGlobal && (user.level ?? 1) < (workoutDoc.requiredLevel ?? 1)) {
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

    const previousLogs = await attachSession(
      WorkoutLog.find({
        user: normalizedUserId,
        "completedExercises.exerciseId": {
          $in: normalizedExercises.map((exercise) => exercise.exerciseId),
        },
      })
        .select("completedExercises")
        .lean(),
      session,
    );

    const previousExercises = previousLogs.flatMap(
      (workoutLog) => workoutLog.completedExercises ?? [],
    );
    const completedWithPersonalBests = flagPersonalBests(
      normalizedExercises,
      previousExercises,
    );

    const xpGain = calculateWorkoutXp(workoutDoc, completedWithPersonalBests);

    const workoutLog = await createWithSession(
      WorkoutLog,
      {
        user: normalizedUserId,
        workoutId: workoutDoc._id,
        workout: workoutDoc.title,
        requiredLevel: workoutDoc.requiredLevel,
        completedExercises: completedWithPersonalBests,
        totalXpGained: xpGain,
        daySlot,
        ...(idempotencyKey ? { idempotencyKey } : {}),
      },
      session,
    );

    await syncWorkoutProgressions({
      userId: normalizedUserId,
      workout: workoutDoc,
      completedExercises: completedWithPersonalBests,
      session,
    });

    const progress = await applyUserProgress({
      userId: normalizedUserId,
      bodyXp: xpGain,
      shouldUpdateStreak: true,
      shouldUnlockAchievements: true,
      session,
      source: "workout",
      sourceEntityId: workoutLog._id,
      description: `Workout: ${workoutDoc.title}`,
    });

    await updateChallengeProgress({ userId: normalizedUserId, type: "workout", session });

    await markDayComplete({ userId: normalizedUserId, day: getIsoWeekDay(new Date()) }).catch(() => {});

    return {
      workoutLog,
      user: progress.user,
      newAchievements: progress.newAchievements,
      totalXpGained: xpGain,
      personalBests: completedWithPersonalBests.filter(
        (exercise) => exercise.isPersonalBest,
      ),
    };
  });
};

module.exports = {
  getMyWorkoutLogs,
  getLatestWorkoutLog,
  createWorkoutLog,
};
