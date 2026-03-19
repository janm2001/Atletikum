import { useCallback, type FormEvent } from "react";
import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import ActionToast from "@/components/Common/ActionToast";
import useActionFeedback from "@/hooks/useActionFeedback";
import type { Exercise } from "@/types/Exercise/exercise";
import type { Workout } from "@/types/Workout/workout";
import { useTrackWorkoutFlow } from "@/hooks/useTrackWorkoutFlow";
import TrackWorkoutExerciseDetailsModal from "./TrackWorkoutExerciseDetailsModal";
import TrackWorkoutExerciseRail from "./TrackWorkoutExerciseRail";
import TrackWorkoutOverview from "./TrackWorkoutOverview";
import TrackWorkoutWorkoutCard from "./TrackWorkoutWorkoutCard";

type TrackWorkoutPageContentProps = {
  workout: Workout;
  exerciseById: Map<string, Exercise>;
};

const TrackWorkoutPageContent = ({
  workout,
  exerciseById,
}: TrackWorkoutPageContentProps) => {
  const { t } = useTranslation();
  const { actionError, clearActionError, handleActionError } =
    useActionFeedback();
  const {
    completedExerciseCount,
    control,
    currentExercise,
    currentIndex,
    currentMetric,
    errors,
    isSubmitting,
    onSubmitCurrentExercise,
    plannedSetCount,
    progressValue,
    selectedExerciseId,
    setFields,
    setSelectedExerciseId,
    setValue,
    totalExercises,
    watchedSets,
  } = useTrackWorkoutFlow({ workout });

  const handleCopyPrevious = useCallback(
    (setIndex: number) => {
      if (setIndex < 1) return;
      const prevSet = watchedSets?.[setIndex - 1];
      if (!prevSet) return;
      setValue(`sets.${setIndex}.loadKg`, prevSet.loadKg);
      setValue(`sets.${setIndex}.resultValue`, prevSet.resultValue);
      setValue(`sets.${setIndex}.rpe`, prevSet.rpe);
    },
    [watchedSets, setValue],
  );

  const handleSubmitCurrentExercise = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      clearActionError();

      try {
        await onSubmitCurrentExercise(event);
      } catch (error) {
        handleActionError(error, t("common.saveError"));
      }
    },
    [clearActionError, handleActionError, onSubmitCurrentExercise, t],
  );

  const selectedExerciseDetail = selectedExerciseId
    ? exerciseById.get(selectedExerciseId)
    : undefined;

  if (!currentExercise) {
    return null;
  }

  return (
    <Stack w="100%" maw={700} mx="auto" px="sm" py="md" gap="sm">
      <ActionToast message={actionError} onClose={clearActionError} />

      <TrackWorkoutOverview
        workout={workout}
        completedExerciseCount={completedExerciseCount}
        progressValue={progressValue}
        totalExercises={totalExercises}
      />

      <TrackWorkoutExerciseRail
        workout={workout}
        currentIndex={currentIndex}
        completedExerciseCount={completedExerciseCount}
        exerciseById={exerciseById}
        onExerciseSelect={setSelectedExerciseId}
      />

      <TrackWorkoutWorkoutCard
        control={control}
        currentExercise={currentExercise}
        currentIndex={currentIndex}
        currentMetric={currentMetric}
        errors={errors}
        exerciseById={exerciseById}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitCurrentExercise}
        onCopyPrevious={handleCopyPrevious}
        plannedSetCount={plannedSetCount}
        setFields={setFields}
        totalExercises={totalExercises}
      />

      <TrackWorkoutExerciseDetailsModal
        exercise={selectedExerciseDetail}
        opened={!!selectedExerciseId}
        onClose={() => setSelectedExerciseId(null)}
      />
    </Stack>
  );
};

export default TrackWorkoutPageContent;
