import { useState } from "react";
import {
  useFieldArray,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import {
  createDefaultSets,
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
import type { CompletedExercisePayload } from "@/types/WorkoutLog/workoutLog";

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
  const { completeWorkout, isSubmitting } = useWorkoutCompletion({ workout });

  const submitCurrentExercise: SubmitHandler<TrackWorkoutFormValues> = async (
    values,
  ) => {
    if (!currentExercise) {
      return;
    }

    const areAllSetsValid = await trigger("sets");
    if (!areAllSetsValid) {
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

    advanceToNextExercise(updatedCompletedExercises);

    const nextExercise = workout.exercises[draft.currentIndex + 1];
    const nextSets = createDefaultSets(
      nextExercise?.sets ?? 1,
      nextExercise?.progression?.prescribedLoadKg ??
        nextExercise?.progression?.initialWeightKg ??
        null,
    );
    draft.persistDraft(draft.currentIndex + 1, updatedCompletedExercises, nextSets);
  };

  return {
    ...draft,
    completedExerciseCount,
    control,
    currentExercise,
    currentIndex: draft.currentIndex,
    currentMetric,
    errors,
    isLastExercise,
    isSubmitting: isSubmitting || draft.submitting,
    onSubmitCurrentExercise: handleSubmit(submitCurrentExercise),
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
