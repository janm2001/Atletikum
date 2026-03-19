import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import ActionToast from "@/components/Common/ActionToast";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import useActionFeedback from "@/hooks/useActionFeedback";
import { sendAbandonedEvent } from "@/hooks/useTrackEvent";
import { useLatestWorkoutLog } from "@/hooks/useWorkoutLogs";
import type { Exercise } from "@/types/Exercise/exercise";
import { getExerciseId, type Workout } from "@/types/Workout/workout";
import type { DraftSetValues } from "@/types/Workout/workoutDraft";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const prefillParam = searchParams.get("prefill");
  const { actionError, clearActionError, handleActionError } =
    useActionFeedback();
  const [setSaveTrigger, setSetSaveTrigger] = useState(0);
  const {
    completedExerciseCount,
    completedSetCount,
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
    startFresh,
    startFromRepeat,
    totalExercises,
    onEditSetAtIndex,
    onGoToExercise,
    onGoToPreviousExercise,
  } = useTrackWorkoutFlow({ workout });

  const {
    data: latestLog,
    isLoading: isLatestLogLoading,
  } = useLatestWorkoutLog(workout._id, !hasDraft);

  const hasRepeatOption =
    latestLog != null &&
    (() => {
      const workoutExerciseIds = workout.exercises
        .map((exercise) => getExerciseId(exercise.exerciseId))
        .sort();
      const logExerciseIds = [
        ...new Set(latestLog.completedExercises.map((exercise) => exercise.exerciseId)),
      ].sort();

      return (
        workoutExerciseIds.length === logExerciseIds.length &&
        workoutExerciseIds.every((id, index) => id === logExerciseIds[index])
      );
    })();

  const handleRepeatLast = useCallback(() => {
    if (!latestLog) return;

    const setValuesByExercise = new Map<string, DraftSetValues[]>();
    for (const entry of latestLog.completedExercises) {
      const existingSets = setValuesByExercise.get(entry.exerciseId) ?? [];
      existingSets.push({
        loadKg: entry.loadKg ?? null,
        resultValue: entry.resultValue,
        rpe: entry.rpe,
      });
      setValuesByExercise.set(entry.exerciseId, existingSets);
    }

    startFromRepeat({
      completedExercises: [],
      setValuesByExercise,
    });
    setSearchParams({}, { replace: true });
  }, [latestLog, setSearchParams, startFromRepeat]);

  // Case 3: No draft, no decision yet → prefill from latest or auto-start
  useEffect(() => {
    if (!hasDraft && draftSource === null && !isLatestLogLoading) {
      if (prefillParam === "last" && hasRepeatOption && latestLog) {
        handleRepeatLast();
      } else {
        // Default to a fresh run unless repeat-last was explicitly requested.
        startFresh();
      }
    }
  }, [
    hasDraft,
    draftSource,
    isLatestLogLoading,
    prefillParam,
    hasRepeatOption,
    latestLog,
    handleRepeatLast,
    startFresh,
  ]);

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
    [
      clearActionError,
      handleActionError,
      isLastExercise,
      onSubmitCurrentExercise,
      t,
    ],
  );

  // Cases 1 & 2: Draft exists but user hasn't decided yet
  if (hasDraft && draftSource === null) {
    return (
      <Stack w="100%" maw={700} mx="auto" px="sm" py="md">
        <DraftPrompt
          isSubmitting={isSubmittingFromDraft}
          hasRepeatOption={hasRepeatOption}
          onResume={resumeDraft}
          onStartFresh={() => {
            discardDraft();
            startFresh();
          }}
          onRepeatLast={handleRepeatLast}
          onRetry={() => {
            resumeDraft();
          }}
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
        onExerciseSelect={(exerciseId, exerciseIndex) => {
          setSelectedExerciseId(exerciseId);
          onGoToExercise(exerciseIndex);
        }}
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
        onEditSet={onEditSetAtIndex}
        onPreviousExercise={onGoToPreviousExercise}
        canGoPreviousExercise={currentIndex > 0}
        completedSetCount={completedSetCount}
        restTimer={
          <RestTimerComponent
            exerciseRestSeconds={currentExercise?.restSeconds}
            visible={!!currentExercise && !isLastExercise}
            triggerCount={setSaveTrigger}
          />
        }
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
