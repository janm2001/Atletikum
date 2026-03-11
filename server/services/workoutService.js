const AppError = require("../utils/AppError");
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

const ensureCanManageWorkout = ({ workout, user }) => {
  const isAdmin = user?.role === "admin";
  const createdBy = workout.createdBy ? String(workout.createdBy) : null;
  const isOwner = createdBy && createdBy === String(user?._id);

  if (!isAdmin && !isOwner) {
    throw new AppError("Nemate dozvolu za upravljanje ovim treningom.", 403);
  }
};

const buildWorkoutFilter = ({ user, scope = "available" }) => {
  if (scope === "global") {
    return GLOBAL_WORKOUT_FILTER;
  }

  if (scope === "mine") {
    return { createdBy: user._id };
  }

  if (scope === "all" && user?.role === "admin") {
    return {};
  }

  return {
    $or: [GLOBAL_WORKOUT_FILTER, { createdBy: user._id }],
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

const getAllWorkouts = async ({ user, scope }) => {
  const workouts = await Workout.find(buildWorkoutFilter({ user, scope }))
    .populate(...workoutListPopulate)
    .sort({ createdBy: 1, requiredLevel: 1, title: 1 });

  return attachWorkoutProgressions({
    userId: user?._id,
    workouts,
  });
};

const getWorkoutById = async ({ workoutId, user }) => {
  const workout = await Workout.findById(workoutId).populate(
    ...workoutListPopulate,
  );

  if (!workout) {
    throw new AppError("Workout not found", 404);
  }

  const createdBy = workout.createdBy ? String(workout.createdBy) : null;
  const isGlobal = createdBy === null;
  const isOwner = createdBy === String(user?._id);
  const isAdmin = user?.role === "admin";

  if (!isGlobal && !isOwner && !isAdmin) {
    throw new AppError("Workout not found", 404);
  }

  const [enrichedWorkout] = await attachWorkoutProgressions({
    userId: user?._id,
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

const updateWorkout = async ({ workoutId, payload, user }) => {
  ensureValidWorkoutProgressionConfig(payload);
  const existingWorkout = await Workout.findById(workoutId);

  if (!existingWorkout) {
    throw new AppError("Workout not found", 404);
  }

  ensureCanManageWorkout({ workout: existingWorkout, user });

  const normalizedPayload = normalizeWorkoutPayload({
    payload,
    createdBy: existingWorkout.createdBy,
  });

  const workout = await Workout.findByIdAndUpdate(
    workoutId,
    normalizedPayload,
    {
      new: true,
      runValidators: true,
    },
  ).populate(...workoutListPopulate);

  const [enrichedWorkout] = await attachWorkoutProgressions({
    userId: user?._id,
    workouts: [workout],
  });

  return enrichedWorkout;
};

const deleteWorkout = async ({ workoutId, user }) => {
  const workout = await Workout.findById(workoutId);

  if (!workout) {
    throw new AppError("Workout not found", 404);
  }

  ensureCanManageWorkout({ workout, user });

  await workout.deleteOne();
};

module.exports = {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};
