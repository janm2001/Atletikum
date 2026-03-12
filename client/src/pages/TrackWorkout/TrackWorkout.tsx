import { useMemo } from "react";
import { Button, Stack, Text } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TrackWorkoutPageContent from "@/components/TrackWorkout/TrackWorkoutPageContent";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useExercises } from "@/hooks/useExercise";
import { useWorkouts } from "@/hooks/useWorkout";

const TrackWorkout = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: exercises, isLoading: exercisesLoading } = useExercises();

  const workoutFromList = useMemo(
    () => (workouts ?? []).find((item) => item._id === id),
    [workouts, id],
  );

  const exerciseById = useMemo(
    () =>
      new Map((exercises ?? []).map((exercise) => [exercise._id, exercise])),
    [exercises],
  );

  if (workoutsLoading || exercisesLoading) {
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

  return (
    <TrackWorkoutPageContent
      workout={workoutFromList}
      exerciseById={exerciseById}
    />
  );
};

export default TrackWorkout;
