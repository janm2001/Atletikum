const METRIC_TYPE = {
  REPS: "reps",
  DISTANCE: "distance",
  TIME: "time",
};

const DISTANCE_REGEX = /(\d+(?:[.,]\d+)?)\s*(m|meter|metara|metar)$/i;
const TIME_REGEX = /(\d+(?:[.,]\d+)?)\s*(s|sec|sek|sekundi|min|minute)$/i;

const parseWorkoutMetric = (prescription) => {
  const normalized = String(prescription ?? "").trim();

  if (DISTANCE_REGEX.test(normalized)) {
    const match = normalized.match(DISTANCE_REGEX);
    return {
      metricType: METRIC_TYPE.DISTANCE,
      unitLabel: match?.[2]?.toLowerCase() === "meter" ? "m" : "m",
    };
  }

  if (TIME_REGEX.test(normalized)) {
    const match = normalized.match(TIME_REGEX);
    const rawUnit = match?.[2]?.toLowerCase() ?? "s";
    return {
      metricType: METRIC_TYPE.TIME,
      unitLabel: rawUnit.startsWith("min") ? "min" : "s",
    };
  }

  return {
    metricType: METRIC_TYPE.REPS,
    unitLabel: "reps",
  };
};

const normalizeCompletedExercise = (exercise, workoutExercise) => {
  const { metricType, unitLabel } = parseWorkoutMetric(workoutExercise.reps);
  const resultValue = Number(exercise.resultValue ?? exercise.reps ?? 0);
  const loadSource = exercise.loadKg ?? exercise.weight;
  const loadKg =
    loadSource === null || loadSource === undefined || loadSource === ""
      ? null
      : Number(loadSource);
  const rpe = Number(exercise.rpe ?? 0);

  if (!Number.isFinite(resultValue) || resultValue <= 0) {
    throw new Error("Vrijednost seta mora biti veća od 0.");
  }

  if (!Number.isFinite(rpe) || rpe < 1 || rpe > 10) {
    throw new Error("RPE mora biti između 1 i 10.");
  }

  if (loadKg !== null && (!Number.isFinite(loadKg) || loadKg < 0)) {
    throw new Error("Opterećenje ne može biti negativno.");
  }

  return {
    exerciseId: String(exercise.exerciseId),
    metricType,
    unitLabel,
    resultValue,
    loadKg,
    weight: loadKg,
    reps: metricType === METRIC_TYPE.REPS ? resultValue : undefined,
    rpe,
    isPersonalBest: false,
  };
};

const calculateWorkoutXp = (workout, completedExercises) => {
  const completedCountByExercise = completedExercises.reduce(
    (acc, exercise) => {
      acc.set(exercise.exerciseId, (acc.get(exercise.exerciseId) ?? 0) + 1);
      return acc;
    },
    new Map(),
  );

  return workout.exercises.reduce((sum, exercise) => {
    const exerciseId = String(exercise.exerciseId);
    const completedSets = completedCountByExercise.get(exerciseId) ?? 0;
    const plannedSets = Math.max(1, Number(exercise.sets ?? 1));
    const coverage = Math.min(completedSets / plannedSets, 1);
    return sum + Math.round((exercise.baseXp ?? 0) * coverage);
  }, 0);
};

const getBestMetricValue = (entries) => {
  if (entries.length === 0) {
    return 0;
  }

  return Math.max(
    ...entries.map((entry) => Number(entry.resultValue ?? entry.reps ?? 0)),
  );
};

const getBestLoadValue = (entries) => {
  const loads = entries
    .map((entry) => entry.loadKg ?? entry.weight)
    .filter((value) => value !== null && value !== undefined)
    .map(Number)
    .filter((value) => Number.isFinite(value));

  if (loads.length === 0) {
    return null;
  }

  return Math.max(...loads);
};

const flagPersonalBests = (completedExercises, previousExercises) => {
  return completedExercises.map((exercise) => {
    const comparable = previousExercises.filter(
      (previous) =>
        String(previous.exerciseId) === exercise.exerciseId &&
        (previous.metricType ?? METRIC_TYPE.REPS) === exercise.metricType &&
        (previous.unitLabel ?? "reps") === exercise.unitLabel,
    );

    const bestLoad = getBestLoadValue(comparable);
    const bestMetric = getBestMetricValue(comparable);
    const currentLoad = exercise.loadKg;
    const isWeightBest =
      currentLoad !== null && currentLoad !== undefined
        ? bestLoad === null || currentLoad > bestLoad
        : false;
    const isMetricBest = bestMetric === 0 || exercise.resultValue > bestMetric;

    return {
      ...exercise,
      isPersonalBest: isWeightBest || isMetricBest,
    };
  });
};

module.exports = {
  METRIC_TYPE,
  parseWorkoutMetric,
  normalizeCompletedExercise,
  calculateWorkoutXp,
  flagPersonalBests,
};
