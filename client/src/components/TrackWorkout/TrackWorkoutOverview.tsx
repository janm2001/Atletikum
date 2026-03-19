import { Badge, Box, Group, Progress, Text, Title } from "@mantine/core";
import type { Workout } from "@/types/Workout/workout";
import { useTranslation } from "react-i18next";

type TrackWorkoutOverviewProps = {
  workout: Workout;
  completedExerciseCount: number;
  progressValue: number;
  totalExercises: number;
};

const TrackWorkoutOverview = ({
  workout,
  completedExerciseCount,
  progressValue,
  totalExercises,
}: TrackWorkoutOverviewProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Title order={3} lineClamp={1}>
            {workout.title}
          </Title>
          <Text c="dimmed" size="sm" lineClamp={1}>
            {workout.description}
          </Text>
        </Box>
        <Badge color="violet" variant="light" style={{ flexShrink: 0 }}>
          {t('common.levelBadge', { level: workout.requiredLevel })}
        </Badge>
      </Group>

      <Box>
        <Group justify="space-between" mb={4}>
          <Text size="xs" c="dimmed">
            {t('training.track.progress')}
          </Text>
          <Text size="xs" fw={600}>
            {Math.min(completedExerciseCount + 1, totalExercises)}/
            {totalExercises}
          </Text>
        </Group>
        <Progress value={progressValue} color="violet" radius="xl" size="sm" />
      </Box>
    </>
  );
};

export default TrackWorkoutOverview;
