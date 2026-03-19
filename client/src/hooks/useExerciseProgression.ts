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
): TrackWorkoutFormValues["sets"] =>
  Array.from({ length: Math.max(1, setCount) }, () => ({
    loadKg: carryOver?.loadKg ?? prescribedLoadKg ?? null,
    resultValue: carryOver?.resultValue ?? 0,
    rpe: carryOver?.rpe ?? 6,
  }));

export const getMetricFromPrescription = (
  prescription: string,
): TrackWorkoutMetric => {
  const normalized = prescription.trim().toLowerCase();

  if (/^(?:\d+(?:[.,]\d+)?)\s*(m|meter|metara|metar)$/.test(normalized)) {
    return {
      metricType: "distance",
      unitLabel: "m",
      label: "Udaljenost (m)",
    };
  }

  if (
    /^(?:\d+(?:[.,]\d+)?)\s*(s|sec|sek|sekundi|min|minute)$/.test(normalized)
  ) {
    return {
      metricType: "time",
      unitLabel: normalized.includes("min") ? "min" : "s",
      label: normalized.includes("min") ? "Trajanje (min)" : "Trajanje (s)",
    };
  }

  return {
    metricType: "reps",
    unitLabel: "reps",
    label: "Ponavljanja",
  };
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
  const plannedSetCount = Math.max(1, Number(currentExercise?.sets ?? 1));
  const currentPrescribedLoadKg = getCurrentPrescribedLoadKg(currentExercise);
  const watchedSets = useWatch({ control, name: "sets" });

  const totalExercises = workout.exercises.length;
  const completedExerciseCount = currentIndex;
  const progressValue =
    totalExercises > 0 ? (completedExerciseCount / totalExercises) * 100 : 0;
  const isLastExercise = currentIndex >= workout.exercises.length - 1;

  useEffect(() => {
    // completedExercises is a flat array of individual set payloads, appended in
    // exercise order. The last entry is always the last set of the most recently
    // completed exercise (exercise at currentIndex - 1). We use it for carry-over
    // without filtering by exerciseId because this ordering is enforced by
    // buildCompletedExerciseSets.
    const prevSet = completedExercises.length > 0
      ? completedExercises[completedExercises.length - 1]
      : null;

    let carryOver: { loadKg: number | null; resultValue: number; rpe: number } | undefined;

    if (prevSet) {
      const currMetricType = currentMetric.metricType;
      const prevMetricType = prevSet.metricType ?? currMetricType; // default to same type if missing = always carry over

      // Only carry over if metric types match (or both are undefined)
      if (currMetricType === prevMetricType) {
        carryOver = {
          loadKg: prevSet.loadKg ?? null,
          resultValue: prevSet.resultValue,
          rpe: prevSet.rpe,
        };
      }
    }

    const defaultSets = createDefaultSets(plannedSetCount, currentPrescribedLoadKg, carryOver);
    reset({ sets: defaultSets });
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // completedExercises intentionally excluded: reset must only fire on exercise change,
  //   not on every set save within the same exercise.
  // currentMetric intentionally excluded: always in sync with currentExercise?.exerciseId
  //   (same derived chain), so including it would be a redundant dep.
  [currentExercise?.exerciseId, currentPrescribedLoadKg, plannedSetCount, reset]);

  const getUpdatedCompletedExercises = useCallback(
    (values: TrackWorkoutFormValues) => {
      if (!currentExercise) {
        return completedExercises;
      }

      return [
        ...completedExercises,
        ...buildCompletedExerciseSets({
          currentExercise,
          currentMetric,
          values,
        }),
      ];
    },
    [completedExercises, currentExercise, currentMetric],
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
