import { Button, Group, ScrollArea } from "@mantine/core";
import type { Exercise } from "@/types/Exercise/exercise";
import { getExerciseId, type Workout } from "@/types/Workout/workout";
import { useTranslation } from "react-i18next";

type TrackWorkoutExerciseRailProps = {
  workout: Workout;
  currentIndex: number;
  completedExerciseCount: number;
  exerciseById: Map<string, Exercise>;
  onExerciseSelect: (exerciseId: string, exerciseIndex: number) => void;
};

const TrackWorkoutExerciseRail = ({
  workout,
  currentIndex,
  completedExerciseCount,
  exerciseById,
  onExerciseSelect,
}: TrackWorkoutExerciseRailProps) => {
  const { t } = useTranslation();
  return (
    <ScrollArea type="auto" offsetScrollbars scrollbarSize={6}>
      <Group gap="xs" wrap="nowrap" py={4}>
        {workout.exercises.map((exercise, index) => {
          const exerciseId = getExerciseId(exercise.exerciseId);
          const exerciseName =
            exerciseById.get(exerciseId)?.title ?? t('training.track.exerciseFallback', { index: index + 1 });
          const isCompleted = index < completedExerciseCount;
          const isCurrent = index === currentIndex;

          return (
            <Button
              key={`${exerciseId}-${index}`}
              variant={isCurrent ? "filled" : "light"}
              color={isCompleted ? "teal" : isCurrent ? "violet" : "gray"}
              size="compact-sm"
              style={{ flexShrink: 0 }}
              onClick={() => onExerciseSelect(exerciseId, index)}
            >
              {exerciseName.length > 14
                ? exerciseName.slice(0, 12) + "…"
                : exerciseName}
            </Button>
          );
        })}
      </Group>
    </ScrollArea>
  );
};

export default TrackWorkoutExerciseRail;
