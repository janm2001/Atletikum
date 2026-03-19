import { useState } from "react";
import {
  useFieldArray,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import {
  createDefaultSets,
  getDefaultResultFromPrescription,
  getMetricFromPrescription,
  useExerciseProgression,
} from "@/hooks/useExerciseProgression";
import { useWorkoutCompletion } from "@/hooks/useWorkoutCompletion";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import type {
  TrackWorkoutFormValues,
} from "@/types/Workout/trackWorkout";
import {
  type Workout,
} from "@/types/Workout/workout";

export { getMetricFromPrescription } from "@/hooks/useExerciseProgression";

type UseTrackWorkoutFlowParams = {
  workout: Workout;
};

export const useTrackWorkoutFlow = ({ workout }: UseTrackWorkoutFlowParams) => {
  const draft = useWorkoutDraft({ workout });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<TrackWorkoutFormValues>({
    defaultValues: {
      sets: draft.initialSetValues.length > 0
        ? draft.initialSetValues
        : createDefaultSets(
            workout.exercises[draft.currentIndex]?.sets ?? 1,
            workout.exercises[draft.currentIndex]?.progression?.prescribedLoadKg ??
              workout.exercises[draft.currentIndex]?.progression?.initialWeightKg ??
              null,
            undefined,
            getDefaultResultFromPrescription(
              workout.exercises[draft.currentIndex]?.reps ?? "",
              getMetricFromPrescription(
                workout.exercises[draft.currentIndex]?.reps ?? "",
              ),
            ),
          ),
    },
  });

  const { fields: setFields } = useFieldArray({
    control,
    name: "sets",
  });
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [completedSetCount, setCompletedSetCount] = useState(0);

  const {
    advanceToNextExercise,
    completedExerciseCount,
    currentExercise,
    currentMetric,
    getUpdatedCompletedExercises,
    isLastExercise,
    plannedSetCount,
    progressValue,
    totalExercises,
    watchedSets,
  } = useExerciseProgression({
    control,
    reset,
    workout,
    currentIndex: draft.currentIndex,
    setCurrentIndex: draft.setCurrentIndex,
    completedExercises: draft.completedExercises,
    setCompletedExercises: draft.setCompletedExercises,
  });
  const { completeWorkout, isSubmitting } = useWorkoutCompletion({
    workout,
    idempotencyKey: draft.idempotencyKey,
  });

  const getExerciseSetCount = (exerciseIndex: number) =>
    Math.max(1, Number(workout.exercises[exerciseIndex]?.sets ?? 1));

  const getCompletedSetCountForExercise = (exerciseIndex: number) => {
    const startOffset = workout.exercises
      .slice(0, exerciseIndex)
      .reduce((sum, exercise) => sum + Math.max(1, Number(exercise.sets ?? 1)), 0);
    const setCount = getExerciseSetCount(exerciseIndex);
    const exerciseId =
      typeof workout.exercises[exerciseIndex]?.exerciseId === "object"
        ? workout.exercises[exerciseIndex].exerciseId._id
        : (workout.exercises[exerciseIndex]?.exerciseId ?? "");
    const completedForExercise = draft.completedExercises
      .slice(startOffset, startOffset + setCount)
      .filter((setItem) => setItem.exerciseId === exerciseId).length;

    return Math.max(0, Math.min(completedForExercise, setCount - 1));
  };

  const goToExercise = (exerciseIndex: number) => {
    const boundedExerciseIndex = Math.max(
      0,
      Math.min(exerciseIndex, workout.exercises.length - 1),
    );
    setCompletedSetCount(getCompletedSetCountForExercise(boundedExerciseIndex));
    draft.setCurrentIndex(boundedExerciseIndex);
  };

  const goToPreviousExercise = () => {
    if (draft.currentIndex <= 0) {
      return;
    }

    goToExercise(draft.currentIndex - 1);
  };

  const editSetAtIndex = (setIndex: number) => {
    const boundedSetIndex = Math.max(0, Math.min(setIndex, setFields.length - 1));
    setCompletedSetCount(boundedSetIndex);
  };

  const submitCurrentExercise: SubmitHandler<TrackWorkoutFormValues> = async (
    values,
  ) => {
    if (!currentExercise) {
      return;
    }

    const activeSetIndex = Math.min(
      completedSetCount,
      Math.max(values.sets.length - 1, 0),
    );
    const isActiveSetValid = await trigger([
      `sets.${activeSetIndex}.loadKg`,
      `sets.${activeSetIndex}.resultValue`,
      `sets.${activeSetIndex}.rpe`,
    ]);
    if (!isActiveSetValid) {
      return;
    }

    const isLastSet = activeSetIndex >= values.sets.length - 1;

    if (!isLastSet) {
      setCompletedSetCount((previous) => previous + 1);
      const nextSetIndex = activeSetIndex + 1;
      if (nextSetIndex < values.sets.length) {
        const previousSet = values.sets[activeSetIndex];
        setValue(`sets.${nextSetIndex}.loadKg`, previousSet.loadKg);
        setValue(`sets.${nextSetIndex}.resultValue`, previousSet.resultValue);
        setValue(`sets.${nextSetIndex}.rpe`, previousSet.rpe);
      }
      draft.persistDraft(
        draft.currentIndex,
        draft.completedExercises,
        values.sets,
        false,
      );
      return;
    }

    const updatedCompletedExercises = getUpdatedCompletedExercises(values);

    if (isLastExercise) {
      draft.markSubmitting(true);
      draft.persistDraft(draft.currentIndex, updatedCompletedExercises, values.sets, true);
      try {
        await completeWorkout(updatedCompletedExercises);
        draft.clearOnSuccess();
      } catch (error) {
        draft.markSubmitting(false);
        draft.persistDraft(draft.currentIndex, updatedCompletedExercises, values.sets, false);
        throw error;
      }
      return;
    }

    setCompletedSetCount(0);
    advanceToNextExercise(updatedCompletedExercises);

    const nextExercise = workout.exercises[draft.currentIndex + 1];
    const nextSets = createDefaultSets(
      nextExercise?.sets ?? 1,
      nextExercise?.progression?.prescribedLoadKg ??
        nextExercise?.progression?.initialWeightKg ??
        null,
      undefined,
      getDefaultResultFromPrescription(
        nextExercise?.reps ?? "",
        getMetricFromPrescription(nextExercise?.reps ?? ""),
      ),
    );
    draft.persistDraft(draft.currentIndex + 1, updatedCompletedExercises, nextSets);
  };

  return {
    ...draft,
    completedExerciseCount,
    completedSetCount,
    control,
    currentExercise,
    currentIndex: draft.currentIndex,
    currentMetric,
    errors,
    isLastExercise,
    isSubmitting: isSubmitting || draft.submitting,
    onSubmitCurrentExercise: handleSubmit(submitCurrentExercise),
    onEditSetAtIndex: editSetAtIndex,
    onGoToExercise: goToExercise,
    onGoToPreviousExercise: goToPreviousExercise,
    plannedSetCount,
    progressValue,
    selectedExerciseId,
    setFields,
    setSelectedExerciseId,
    setValue,
    totalExercises,
    watchedSets,
  };
};
