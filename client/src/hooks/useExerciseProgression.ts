import { useCallback, useEffect, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  useWatch,
  type Control,
  type UseFormReset,
} from "react-hook-form";
import type {
  TrackWorkoutFormValues,
  TrackWorkoutMetric,
} from "@/types/Workout/trackWorkout";
import {
  getExerciseId,
  type Workout,
} from "@/types/Workout/workout";
import type { CompletedExercisePayload } from "@/types/WorkoutLog/workoutLog";

type UseExerciseProgressionParams = {
  control: Control<TrackWorkoutFormValues>;
  reset: UseFormReset<TrackWorkoutFormValues>;
  workout: Workout;
  currentIndex: number;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  completedExercises: CompletedExercisePayload[];
  setCompletedExercises: Dispatch<SetStateAction<CompletedExercisePayload[]>>;
};

const getExerciseSetCount = (exercise: Workout["exercises"][number] | undefined) =>
  Math.max(1, Number(exercise?.sets ?? 1));

const getCurrentPrescribedLoadKg = (
  exercise: Workout["exercises"][number] | undefined,
) =>
  exercise?.progression?.prescribedLoadKg ??
  exercise?.progression?.initialWeightKg ??
  null;

export const createDefaultSets = (
  setCount: number,
  prescribedLoadKg: number | null | undefined,
  carryOver?: { loadKg: number | null; resultValue: number; rpe: number },
  defaultResultValue?: number | null,
): TrackWorkoutFormValues["sets"] =>
  Array.from({ length: Math.max(1, setCount) }, () => ({
    loadKg: carryOver?.loadKg ?? prescribedLoadKg ?? null,
    resultValue: carryOver?.resultValue ?? defaultResultValue ?? 0,
    rpe: carryOver?.rpe ?? 6,
  }));

export const getMetricFromPrescription = (
  prescription: string,
): TrackWorkoutMetric => {
  const normalized = prescription.trim().toLowerCase();
  const withoutSetPrefix = normalized.replace(/^\d+\s*[x×]\s*/, "");

  if (/^(?:\d+(?:[.,]\d+)?)\s*(m|meter|metara|metar)$/.test(withoutSetPrefix)) {
    return {
      metricType: "distance",
      unitLabel: "m",
      label: "Udaljenost (m)",
    };
  }

  if (
    /^(?:\d+(?:[.,]\d+)?)\s*(s|sec|sek|sekundi|min|minute)$/.test(
      withoutSetPrefix,
    )
  ) {
    return {
      metricType: "time",
      unitLabel: withoutSetPrefix.includes("min") ? "min" : "s",
      label: withoutSetPrefix.includes("min")
        ? "Trajanje (min)"
        : "Trajanje (s)",
    };
  }

  return {
    metricType: "reps",
    unitLabel: "reps",
    label: "Ponavljanja",
  };
};

export const getDefaultResultFromPrescription = (
  prescription: string,
  metric: TrackWorkoutMetric,
): number | null => {
  const normalized = prescription.trim().toLowerCase();
  const withoutSetPrefix = normalized.replace(/^\d+\s*[x×]\s*/, "");
  const compact = withoutSetPrefix.replace(/\s+/g, "");

  if (metric.metricType === "reps") {
    const repsMatch = compact.match(/^(\d+)$/);
    if (repsMatch) {
      return Number(repsMatch[1]);
    }
    return null;
  }

  if (metric.metricType === "distance" || metric.metricType === "time") {
    const valueMatch = withoutSetPrefix.match(/^(\d+(?:[.,]\d+)?)/);
    if (valueMatch) {
      return Number(valueMatch[1].replace(",", "."));
    }
  }

  return null;
};

type BuildCompletedExerciseSetsParams = {
  currentExercise: Workout["exercises"][number];
  currentMetric: TrackWorkoutMetric;
  values: TrackWorkoutFormValues;
};

export const buildCompletedExerciseSets = ({
  currentExercise,
  currentMetric,
  values,
}: BuildCompletedExerciseSetsParams): CompletedExercisePayload[] =>
  values.sets.map((setItem) => ({
    exerciseId: getExerciseId(currentExercise.exerciseId),
    metricType: currentMetric.metricType,
    unitLabel: currentMetric.unitLabel,
    resultValue: Number(setItem.resultValue ?? 0),
    loadKg:
      setItem.loadKg === null || setItem.loadKg === undefined
        ? null
        : Number(setItem.loadKg),
    rpe: Number(setItem.rpe ?? 0),
  }));

export const useExerciseProgression = ({
  control,
  reset,
  workout,
  currentIndex,
  setCurrentIndex,
  completedExercises,
  setCompletedExercises,
}: UseExerciseProgressionParams) => {

  const currentExercise = workout.exercises[currentIndex];
  const currentMetric = useMemo(
    () => getMetricFromPrescription(currentExercise?.reps ?? ""),
    [currentExercise?.reps],
  );
  const plannedSetCount = getExerciseSetCount(currentExercise);
  const currentPrescribedLoadKg = getCurrentPrescribedLoadKg(currentExercise);
  const watchedSets = useWatch({ control, name: "sets" });

  const totalExercises = workout.exercises.length;
  const completedExerciseCount = currentIndex;
  const progressValue =
    totalExercises > 0 ? (completedExerciseCount / totalExercises) * 100 : 0;
  const isLastExercise = currentIndex >= workout.exercises.length - 1;

  useEffect(() => {
    const defaultResultValue = getDefaultResultFromPrescription(
      currentExercise?.reps ?? "",
      currentMetric,
    );
    const defaultSets = createDefaultSets(
      plannedSetCount,
      currentPrescribedLoadKg,
      undefined,
      defaultResultValue,
    );
    reset({ sets: defaultSets });
  }, [currentExercise?.reps, currentMetric, currentPrescribedLoadKg, plannedSetCount, reset]);

  const getUpdatedCompletedExercises = useCallback(
    (values: TrackWorkoutFormValues) => {
      if (!currentExercise) {
        return completedExercises;
      }

      const currentExerciseSets = buildCompletedExerciseSets({
        currentExercise,
        currentMetric,
        values,
      });
      const startOffset = workout.exercises
        .slice(0, currentIndex)
        .reduce((sum, exercise) => sum + getExerciseSetCount(exercise), 0);
      const endOffset = startOffset + getExerciseSetCount(currentExercise);

      return [
        ...completedExercises.slice(0, startOffset),
        ...currentExerciseSets,
        ...completedExercises.slice(endOffset),
      ];
    },
    [completedExercises, currentExercise, currentIndex, currentMetric, workout.exercises],
  );

  const advanceToNextExercise = useCallback(
    (updatedCompletedExercises: CompletedExercisePayload[]) => {
      setCompletedExercises(updatedCompletedExercises);
      setCurrentIndex((previous) => previous + 1);
    },
    [setCompletedExercises, setCurrentIndex],
  );

  return {
    advanceToNextExercise,
    completedExerciseCount,
    currentExercise,
    currentIndex,
    currentMetric,
    getUpdatedCompletedExercises,
    isLastExercise,
    plannedSetCount,
    progressValue,
    totalExercises,
    watchedSets,
  };
};
