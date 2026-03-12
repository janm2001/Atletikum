const METRIC_TYPE = {
  REPS: "reps",
  DISTANCE: "distance",
  TIME: "time",
};
const {
  validateNumberInRange,
  validateOptionalNonNegativeNumber,
  validatePositiveNumber,
} = require("./validationHelpers");

const DISTANCE_REGEX = /(\d+(?:[.,]\d+)?)\s*(m|meter|metara|metar)$/i;
const TIME_REGEX = /(\d+(?:[.,]\d+)?)\s*(s|sec|sek|sekundi|min|minute)$/i;
const createMetricError = (message) => new Error(message);

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
  const resultValue = validatePositiveNumber(
    exercise.resultValue ?? exercise.reps ?? 0,
    "Vrijednost seta mora biti veća od 0.",
    createMetricError,
  );
  const loadKg = validateOptionalNonNegativeNumber(
    exercise.loadKg ?? exercise.weight,
    "Opterećenje ne može biti negativno.",
    createMetricError,
  );
  const rpe = validateNumberInRange(exercise.rpe ?? 0, {
    min: 1,
    max: 10,
    message: "RPE mora biti između 1 i 10.",
    createError: createMetricError,
  });

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

const getSummaryLabel = (exercise) => {
  if (exercise.loadKg !== null && exercise.loadKg !== undefined) {
    return "Najveća težina";
  }

  if (exercise.metricType === METRIC_TYPE.DISTANCE) {
    return "Najduža udaljenost";
  }

  if (exercise.metricType === METRIC_TYPE.TIME) {
    return "Najduže trajanje";
  }

  return "Najviše ponavljanja";
};

const summarizePersonalBests = (workoutLogs, exerciseNameById) => {
  const summaryByExercise = new Map();

  for (const log of workoutLogs) {
    for (const exercise of log.completedExercises ?? []) {
      const key = `${exercise.exerciseId}:${exercise.metricType ?? METRIC_TYPE.REPS}`;
      const existing = summaryByExercise.get(key);
      const currentScore = Number(
        exercise.loadKg ??
          exercise.weight ??
          exercise.resultValue ??
          exercise.reps ??
          0,
      );
      const existingScore = existing
        ? Number(
            existing.loadKg ??
              existing.weight ??
              existing.resultValue ??
              existing.reps ??
              0,
          )
        : -1;

      if (!existing || currentScore > existingScore) {
        summaryByExercise.set(key, {
          ...exercise,
          achievedAt: log.date,
          workoutTitle: log.workout,
          exerciseName:
            exerciseNameById.get(String(exercise.exerciseId)) ??
            "Nepoznata vježba",
        });
      }
    }
  }

  return [...summaryByExercise.values()]
    .map((entry) => ({
      exerciseId: String(entry.exerciseId),
      exerciseName: entry.exerciseName,
      metricType: entry.metricType ?? METRIC_TYPE.REPS,
      unitLabel: entry.unitLabel ?? "reps",
      bestValue: Number(entry.resultValue ?? entry.reps ?? 0),
      loadKg: entry.loadKg ?? entry.weight ?? null,
      label: getSummaryLabel(entry),
      achievedAt: entry.achievedAt,
      workoutTitle: entry.workoutTitle,
    }))
    .sort(
      (left, right) =>
        new Date(right.achievedAt ?? 0) - new Date(left.achievedAt ?? 0),
    );
};

const buildNextSessionSuggestions = ({
  recommendedWorkouts,
  workoutLogs,
  readinessScore,
  feedbackScore,
  exerciseNameById,
}) => {
  const historyByExercise = new Map();

  for (const log of workoutLogs) {
    for (const exercise of log.completedExercises ?? []) {
      const key = String(exercise.exerciseId);
      const current = historyByExercise.get(key) ?? [];
      current.push({ ...exercise, date: log.date });
      historyByExercise.set(key, current);
    }
  }

  const suggestions = [];

  for (const workout of recommendedWorkouts) {
    for (const exercise of workout.exercises ?? []) {
      const exerciseId = String(
        exercise.exerciseId?._id ?? exercise.exerciseId,
      );
      const history = historyByExercise.get(exerciseId) ?? [];
      const latest = history[0];
      const parsedMetric = parseWorkoutMetric(exercise.reps);

      if (!latest) {
        suggestions.push({
          exerciseId,
          exerciseName:
            exerciseNameById.get(exerciseId) ??
            exercise.exerciseId?.title ??
            "Nepoznata vježba",
          metricType: parsedMetric.metricType,
          unitLabel: parsedMetric.unitLabel,
          suggestedValue: null,
          suggestedLoadKg: null,
          reason: "Nema povijesti za ovu vježbu, kreni po planu treninga.",
        });
        continue;
      }

      let suggestedValue = Number(latest.resultValue ?? latest.reps ?? 0);
      let suggestedLoadKg = latest.loadKg ?? latest.weight ?? null;
      let reason = "Zadrži isti cilj i fokusiraj se na kvalitetu izvedbe.";

      if (
        readinessScore >= 3 &&
        feedbackScore >= 3 &&
        Number(latest.rpe ?? 10) <= 7
      ) {
        if (
          suggestedLoadKg !== null &&
          parsedMetric.metricType === METRIC_TYPE.REPS
        ) {
          suggestedLoadKg = Number((suggestedLoadKg + 2.5).toFixed(1));
          reason =
            "Zadnji setovi su bili pod kontrolom, probaj blagi rast opterećenja.";
        } else if (parsedMetric.metricType === METRIC_TYPE.DISTANCE) {
          suggestedValue = Number((suggestedValue + 5).toFixed(1));
          reason =
            "Forma je stabilna, probaj produžiti udaljenost za mali korak.";
        } else if (parsedMetric.metricType === METRIC_TYPE.TIME) {
          suggestedValue = Number((suggestedValue + 5).toFixed(1));
          reason = "Dobra spremnost dopušta malo dulje trajanje seta.";
        } else {
          suggestedValue = Number((suggestedValue + 1).toFixed(1));
          reason = "Možeš podignuti cilj za jedno dodatno ponavljanje.";
        }
      } else if (
        readinessScore < 3 ||
        feedbackScore < 3 ||
        Number(latest.rpe ?? 0) >= 9
      ) {
        if (suggestedLoadKg !== null) {
          suggestedLoadKg = Number(
            Math.max(0, suggestedLoadKg - 2.5).toFixed(1),
          );
        }
        reason =
          "Spremnost je niža, zadrži ili lagano smanji opterećenje ovaj put.";
      }

      suggestions.push({
        exerciseId,
        exerciseName:
          exerciseNameById.get(exerciseId) ??
          exercise.exerciseId?.title ??
          "Nepoznata vježba",
        metricType: parsedMetric.metricType,
        unitLabel: parsedMetric.unitLabel,
        suggestedValue,
        suggestedLoadKg,
        reason,
      });
    }
  }

  return suggestions.slice(0, 4);
};

module.exports = {
  METRIC_TYPE,
  parseWorkoutMetric,
  normalizeCompletedExercise,
  calculateWorkoutXp,
  flagPersonalBests,
  summarizePersonalBests,
  buildNextSessionSuggestions,
};
