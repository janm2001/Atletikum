import { useMemo } from "react";
import { Button, Stack, Text } from "@mantine/core";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TrackWorkoutPageContent from "@/components/TrackWorkout/TrackWorkoutPageContent";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useExercises } from "@/hooks/useExercise";
import { useWorkouts } from "@/hooks/useWorkout";
import type { Workout } from "@/types/Workout/workout";

type TrackWorkoutLocationState = {
  workout?: Workout;
};

const TrackWorkout = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: exercises, isLoading: exercisesLoading } = useExercises();

  const locationState = location.state as TrackWorkoutLocationState | null;

  const workoutFromList = useMemo(
    () => (workouts ?? []).find((item) => item._id === id),
    [workouts, id],
  );

  const workout = locationState?.workout ?? workoutFromList;

  const exerciseById = useMemo(
    () =>
      new Map((exercises ?? []).map((exercise) => [exercise._id, exercise])),
    [exercises],
  );

  if (workoutsLoading || exercisesLoading) {
    return <SpinnerComponent size="md" fullHeight={false} />;
  }

  if (!workout) {
    return (
      <Stack align="center" py="xl" gap="md">
        <Text c="dimmed">Workout nije pronađen.</Text>
        <Button variant="light" onClick={() => navigate("/zapis-treninga")}>
          Nazad
        </Button>
      </Stack>
    );
  }

  return (
    <TrackWorkoutPageContent workout={workout} exerciseById={exerciseById} />
  );
};

export default TrackWorkout;
