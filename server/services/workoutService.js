const AppError = require("../utils/AppError");
const { requireUserId } = require("../utils/userIdentity");
const { Workout } = require("../models/Workout");
const {
  attachWorkoutProgressions,
  isProgressionEnabled,
  parseRepTarget,
} = require("./progressionService");

const workoutListPopulate = ["exercises.exerciseId", "title imageLink"];

const DEFAULT_CUSTOM_WORKOUT_LEVEL = 1;

const GLOBAL_WORKOUT_FILTER = {
  $or: [{ createdBy: null }, { createdBy: { $exists: false } }],
};

const ensureValidWorkoutProgressionConfig = (payload = {}) => {
  for (const exercise of payload.exercises ?? []) {
    if (!isProgressionEnabled(exercise)) {
      continue;
    }

    const repTarget = parseRepTarget(exercise.reps);
    if (repTarget === null) {
      throw new AppError(
        "Progressivna vježba mora imati točno zadani broj ponavljanja.",
        400,
      );
    }

    const initialWeightKg = Number(exercise.progression?.initialWeightKg);
    if (!Number.isFinite(initialWeightKg) || initialWeightKg < 0) {
      throw new AppError(
        "Progressivna vježba mora imati početnu težinu veću ili jednaku 0.",
        400,
      );
    }
  }
};

const ensureCanManageWorkout = ({ workout, userId, userRole }) => {
  const isAdmin = userRole === "admin";
  const createdBy = workout.createdBy ? String(workout.createdBy) : null;
  const isOwner = createdBy && createdBy === userId;

  if (!isAdmin && !isOwner) {
    throw new AppError("Nemate dozvolu za upravljanje ovim treningom.", 403);
  }
};

const buildWorkoutFilter = ({ userId, userRole, scope = "available" }) => {
  if (scope === "global") {
    return GLOBAL_WORKOUT_FILTER;
  }

  if (scope === "mine") {
    return { createdBy: userId };
  }

  if (scope === "all" && userRole === "admin") {
    return {};
  }

  return {
    $or: [GLOBAL_WORKOUT_FILTER, { createdBy: userId }],
  };
};

const normalizeWorkoutPayload = ({ payload = {}, createdBy }) => {
  if (!createdBy) {
    return payload;
  }

  return {
    ...payload,
    requiredLevel: DEFAULT_CUSTOM_WORKOUT_LEVEL,
  };
};

const getAllWorkouts = async ({ user, userId, scope }) => {
  const normalizedUserId = requireUserId({ userId, user });
  const workouts = await Workout.find(
    buildWorkoutFilter({
      userId: normalizedUserId,
      userRole: user?.role,
      scope,
    }),
  )
    .populate(...workoutListPopulate)
    .sort({ createdBy: 1, requiredLevel: 1, title: 1 });

  return attachWorkoutProgressions({
    userId: normalizedUserId,
    workouts,
  });
};

const getWorkoutById = async ({ workoutId, user, userId }) => {
  const normalizedUserId = requireUserId({ userId, user });
  const workout = await Workout.findById(workoutId).populate(
    ...workoutListPopulate,
  );

  if (!workout) {
    throw new AppError("Workout not found", 404);
  }

  const createdBy = workout.createdBy ? String(workout.createdBy) : null;
  const isGlobal = createdBy === null;
  const isOwner = createdBy === normalizedUserId;
  const isAdmin = user?.role === "admin";

  if (!isGlobal && !isOwner && !isAdmin) {
    throw new AppError("Workout not found", 404);
  }

  const [enrichedWorkout] = await attachWorkoutProgressions({
    userId: normalizedUserId,
    workouts: [workout],
  });

  return enrichedWorkout;
};

const createWorkout = async ({ payload, createdBy = null }) => {
  ensureValidWorkoutProgressionConfig(payload);

  return Workout.create({
    ...normalizeWorkoutPayload({ payload, createdBy }),
    createdBy,
  });
};

const updateWorkout = async ({ workoutId, payload, user, userId }) => {
  const normalizedUserId = requireUserId({ userId, user });
  ensureValidWorkoutProgressionConfig(payload);
  const existingWorkout = await Workout.findById(workoutId);

  if (!existingWorkout) {
    throw new AppError("Workout not found", 404);
  }

  ensureCanManageWorkout({
    workout: existingWorkout,
    userId: normalizedUserId,
    userRole: user?.role,
  });

  const normalizedPayload = normalizeWorkoutPayload({
    payload,
    createdBy: existingWorkout.createdBy,
  });

  const workout = await Workout.findByIdAndUpdate(
    workoutId,
    normalizedPayload,
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).populate(...workoutListPopulate);

  const [enrichedWorkout] = await attachWorkoutProgressions({
    userId: normalizedUserId,
    workouts: [workout],
  });

  return enrichedWorkout;
};

const deleteWorkout = async ({ workoutId, user, userId }) => {
  const normalizedUserId = requireUserId({ userId, user });
  const workout = await Workout.findById(workoutId);

  if (!workout) {
    throw new AppError("Workout not found", 404);
  }

  ensureCanManageWorkout({
    workout,
    userId: normalizedUserId,
    userRole: user?.role,
  });

  await workout.deleteOne();
};

module.exports = {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};
