import { useMemo } from "react";
import { Button, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TrackWorkoutPageContent from "@/components/TrackWorkout/TrackWorkoutPageContent";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useExercises } from "@/hooks/useExercise";
import { useWorkouts } from "@/hooks/useWorkout";
import { useDailyProgress } from "@/hooks/useDailyProgress";

const TrackWorkout = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const { data: dailyProgress, isLoading: dailyProgressLoading } = useDailyProgress();

  const workoutFromList = useMemo(
    () => (workouts ?? []).find((item) => item._id === id),
    [workouts, id],
  );

  const exerciseById = useMemo(
    () =>
      new Map((exercises ?? []).map((exercise) => [exercise._id, exercise])),
    [exercises],
  );

  if (workoutsLoading || exercisesLoading || dailyProgressLoading) {
    return <SpinnerComponent size="md" fullHeight={false} />;
  }

  if (!workoutFromList) {
    return (
      <Stack align="center" py="xl" gap="md">
        <Text c="dimmed">{t('training.track.notFound')}</Text>
        <Button variant="light" onClick={() => navigate("/zapis-treninga")}>
          {t('common.back')}
        </Button>
      </Stack>
    );
  }

  if (dailyProgress && !dailyProgress.canTrain) {
    return (
      <Stack align="center" py="xl" gap="md">
        <ThemeIcon color="orange" variant="light" size="xl" radius="xl">
          <IconAlertCircle />
        </ThemeIcon>
        <Text fw={600}>{t('training.track.dailyLimitTitle')}</Text>
        <Text c="dimmed" ta="center" size="sm">
          {t('training.track.dailyLimitBody', { limit: dailyProgress.limit })}
        </Text>
        <Button variant="light" onClick={() => navigate('/pregled')}>
          {t('common.back')}
        </Button>
      </Stack>
    );
  }

  return (
    <TrackWorkoutPageContent
      workout={workoutFromList}
      exerciseById={exerciseById}
    />
  );
};

export default TrackWorkout;
