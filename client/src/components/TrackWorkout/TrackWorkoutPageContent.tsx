import { Stack } from "@mantine/core";
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
    totalExercises,
    watchedSets,
  } = useTrackWorkoutFlow({ workout });

  const selectedExerciseDetail = selectedExerciseId
    ? exerciseById.get(selectedExerciseId)
    : undefined;

  if (!currentExercise) {
    return null;
  }

  return (
    <Stack w="100%" maw={700} mx="auto" px="sm" py="md" gap="sm">
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
        onSubmit={onSubmitCurrentExercise}
        plannedSetCount={plannedSetCount}
        setFields={setFields}
        totalExercises={totalExercises}
        watchedSets={watchedSets}
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
