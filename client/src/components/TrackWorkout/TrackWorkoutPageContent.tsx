import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import ActionToast from "@/components/Common/ActionToast";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import useActionFeedback from "@/hooks/useActionFeedback";
import { sendAbandonedEvent } from "@/hooks/useTrackEvent";
import type { Exercise } from "@/types/Exercise/exercise";
import type { Workout } from "@/types/Workout/workout";
import { useTrackWorkoutFlow } from "@/hooks/useTrackWorkoutFlow";
import DraftPrompt from "./DraftPrompt";
import TrackWorkoutExerciseDetailsModal from "./TrackWorkoutExerciseDetailsModal";
import TrackWorkoutExerciseRail from "./TrackWorkoutExerciseRail";
import TrackWorkoutOverview from "./TrackWorkoutOverview";
import TrackWorkoutWorkoutCard from "./TrackWorkoutWorkoutCard";
import RestTimerComponent from "./RestTimer";

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
  const [setSaveTrigger, setSetSaveTrigger] = useState(0);
  const {
    completedExerciseCount,
    control,
    currentExercise,
    currentIndex,
    currentMetric,
    draftSource,
    errors,
    hasDraft,
    isLastExercise,
    isSubmitting,
    isSubmittingFromDraft,
    onSubmitCurrentExercise,
    progressValue,
    resumeDraft,
    discardDraft,
    selectedExerciseId,
    setFields,
    setSelectedExerciseId,
    setValue,
    startFresh,
    totalExercises,
    watchedSets,
  } = useTrackWorkoutFlow({ workout });

  // Phase 5 guard — useLatestWorkoutLog doesn't exist yet
  const isLatestLogLoading = false;

  // Case 3: No draft, no decision yet → auto-start fresh
  useEffect(() => {
    if (!hasDraft && draftSource === null && !isLatestLogLoading) {
      startFresh();
    }
  }, [hasDraft, draftSource, startFresh, isLatestLogLoading]);

  // beforeunload: fire abandoned analytics event
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (draftSource) {
        sendAbandonedEvent({
          workoutId: workout._id,
          exerciseIndex: currentIndex,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [draftSource, workout._id, currentIndex]);

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
        if (!isLastExercise) {
          setSetSaveTrigger((prev) => prev + 1);
        }
      } catch (error) {
        handleActionError(error, t("common.saveError"));
      }
    },
    [clearActionError, handleActionError, isLastExercise, onSubmitCurrentExercise, t],
  );

  // Cases 1 & 2: Draft exists but user hasn't decided yet
  if (hasDraft && draftSource === null) {
    return (
      <Stack w="100%" maw={700} mx="auto" px="sm" py="md">
        <DraftPrompt
          isSubmitting={isSubmittingFromDraft}
          hasRepeatOption={false}
          onResume={resumeDraft}
          onStartFresh={() => {
            discardDraft();
            startFresh();
          }}
          onRepeatLast={() => {}}
          onRetry={() => { resumeDraft(); }}
        />
      </Stack>
    );
  }

  // Case 4: No draft and draftSource is still null (startFresh hasn't fired yet) → spinner
  if (draftSource === null) {
    return <SpinnerComponent size="md" fullHeight={false} />;
  }

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
        setFields={setFields}
        totalExercises={totalExercises}
      />

      <RestTimerComponent
        exerciseRestSeconds={currentExercise?.restSeconds}
        visible={!!currentExercise && !isLastExercise}
        triggerCount={setSaveTrigger}
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
