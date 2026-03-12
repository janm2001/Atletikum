const { ExerciseProgression } = require("../models/ExerciseProgression");
const { attachSession } = require("../utils/mongoTransaction");

const DEFAULT_INCREMENT_KG = 2.5;

const toObjectIdString = (value) => String(value);

const createProgressionKey = ({ workoutId, exerciseId }) =>
  `${toObjectIdString(workoutId)}:${toObjectIdString(exerciseId)}`;

const isProgressionEnabled = (exercise) =>
  Boolean(exercise?.progression?.enabled);

const parseRepTarget = (reps) => {
  const normalized = String(reps ?? "").trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  return Number(normalized);
};

const getProgressionRecords = async ({ userId, workouts, session = null }) => {
  const pairs = workouts.flatMap((workout) =>
    (workout.exercises ?? []).filter(isProgressionEnabled).map((exercise) => ({
      workoutId: workout._id,
      exerciseId: exercise.exerciseId?._id ?? exercise.exerciseId,
    })),
  );

  if (pairs.length === 0) {
    return [];
  }

  return attachSession(
    ExerciseProgression.find({
      userId,
      $or: pairs.map(({ workoutId, exerciseId }) => ({
        workoutId,
        exerciseId,
      })),
    }).lean(),
    session,
  );
};

const attachWorkoutProgressions = async ({ userId, workouts, session = null }) => {
  if (!userId || workouts.length === 0) {
    return workouts;
  }

  const records = await getProgressionRecords({ userId, workouts, session });
  const progressionMap = new Map(
    records.map((record) => [
      createProgressionKey({
        workoutId: record.workoutId,
        exerciseId: record.exerciseId,
      }),
      record,
    ]),
  );

  return workouts.map((workoutDoc) => {
    const workout =
      typeof workoutDoc.toObject === "function"
        ? workoutDoc.toObject()
        : workoutDoc;

    return {
      ...workout,
      createdBy: workout.createdBy ? toObjectIdString(workout.createdBy) : null,
      exercises: (workout.exercises ?? []).map((exercise) => {
        const exerciseId = exercise.exerciseId?._id ?? exercise.exerciseId;
        const key = createProgressionKey({
          workoutId: workout._id,
          exerciseId,
        });
        const record = progressionMap.get(key);
        const progression = exercise.progression ?? {
          enabled: false,
          initialWeightKg: null,
          incrementKg: DEFAULT_INCREMENT_KG,
        };

        return {
          ...exercise,
          progression: {
            enabled: Boolean(progression.enabled),
            initialWeightKg:
              progression.initialWeightKg === null ||
              progression.initialWeightKg === undefined
                ? null
                : Number(progression.initialWeightKg),
            incrementKg: Number(
              progression.incrementKg ?? DEFAULT_INCREMENT_KG,
            ),
            prescribedLoadKg: progression.enabled
              ? Number(
                  record?.currentTargetKg ?? progression.initialWeightKg ?? 0,
                )
              : null,
          },
        };
      }),
    };
  });
};

const syncWorkoutProgressions = async ({
  userId,
  workout,
  completedExercises,
  session = null,
}) => {
  const progressionExercises = (workout.exercises ?? []).filter(
    isProgressionEnabled,
  );

  if (progressionExercises.length === 0) {
    return;
  }

  const existingRecords = await attachSession(
    ExerciseProgression.find({
      userId,
      workoutId: workout._id,
      exerciseId: {
        $in: progressionExercises.map((exercise) => exercise.exerciseId),
      },
    }),
    session,
  );

  const recordMap = new Map(
    existingRecords.map((record) => [
      createProgressionKey({
        workoutId: record.workoutId,
        exerciseId: record.exerciseId,
      }),
      record,
    ]),
  );

  const groupedCompletedExercises = completedExercises.reduce(
    (map, exercise) => {
      const key = toObjectIdString(exercise.exerciseId);
      const current = map.get(key) ?? [];
      current.push(exercise);
      map.set(key, current);
      return map;
    },
    new Map(),
  );
  const progressionWrites = [];
  const queuedExistingRecordKeys = new Set();

  for (const workoutExercise of progressionExercises) {
    const repTarget = parseRepTarget(workoutExercise.reps);
    if (repTarget === null) {
      continue;
    }

    const exerciseId = toObjectIdString(workoutExercise.exerciseId);
    const key = createProgressionKey({
      workoutId: workout._id,
      exerciseId,
    });
    const record = recordMap.get(key);
    const plannedSets = Number(workoutExercise.sets ?? 0);
    const exerciseSets = groupedCompletedExercises.get(exerciseId) ?? [];
    const configuredTargetKg = Number(
      record?.currentTargetKg ?? workoutExercise.progression.initialWeightKg,
    );
    const incrementKg = Number(
      workoutExercise.progression.incrementKg ?? DEFAULT_INCREMENT_KG,
    );

    if (!Number.isFinite(configuredTargetKg)) {
      continue;
    }

    const metTarget =
      exerciseSets.length === plannedSets &&
      exerciseSets.every((set) => {
        const loadKg = Number(set.loadKg ?? NaN);
        const reps = Number(set.resultValue ?? NaN);
        return (
          Number.isFinite(loadKg) &&
          Number.isFinite(reps) &&
          loadKg >= configuredTargetKg &&
          reps >= repTarget
        );
      });

    const lastCompletedSet = exerciseSets.at(-1);
    const lastSuccessfulLoadKg = metTarget
      ? Number(lastCompletedSet?.loadKg ?? configuredTargetKg)
      : (record?.lastSuccessfulLoadKg ?? null);
    const nextTargetKg = metTarget
      ? lastSuccessfulLoadKg + incrementKg
      : configuredTargetKg;
    const lastCompletedAt = new Date();

    if (record) {
      record.currentTargetKg = nextTargetKg;
      record.incrementKg = incrementKg;
      record.lastSuccessfulLoadKg = lastSuccessfulLoadKg;
      record.lastCompletedAt = lastCompletedAt;
      if (!queuedExistingRecordKeys.has(key)) {
        progressionWrites.push(record);
        queuedExistingRecordKeys.add(key);
      }
      continue;
    }

    progressionWrites.push(
      new ExerciseProgression({
        userId,
        workoutId: workout._id,
        exerciseId: workoutExercise.exerciseId,
        currentTargetKg: nextTargetKg,
        incrementKg,
        lastSuccessfulLoadKg,
        lastCompletedAt,
      }),
    );
  }

  if (progressionWrites.length === 0) {
    return;
  }

  await ExerciseProgression.bulkSave(
    progressionWrites,
    session ? { session } : undefined,
  );
};

module.exports = {
  DEFAULT_INCREMENT_KG,
  attachWorkoutProgressions,
  createProgressionKey,
  isProgressionEnabled,
  parseRepTarget,
  syncWorkoutProgressions,
};
