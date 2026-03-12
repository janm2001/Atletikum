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
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<TrackWorkoutFormValues>({
    defaultValues: {
      sets: createDefaultSets(
        workout.exercises[0]?.sets ?? 1,
        workout.exercises[0]?.progression?.prescribedLoadKg ??
          workout.exercises[0]?.progression?.initialWeightKg ??
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
    currentIndex,
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
      await completeWorkout(updatedCompletedExercises);
      return;
    }

    advanceToNextExercise(updatedCompletedExercises);
  };

  return {
    completedExerciseCount,
    control,
    currentExercise,
    currentIndex,
    currentMetric,
    errors,
    isSubmitting,
    onSubmitCurrentExercise: handleSubmit(submitCurrentExercise),
    plannedSetCount,
    progressValue,
    selectedExerciseId,
    setFields,
    setSelectedExerciseId,
    totalExercises,
    watchedSets,
  };
};
