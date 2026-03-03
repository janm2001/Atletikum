import { Box, Grid, Stack, Text } from "@mantine/core";
import WorkoutCard from "./WorkoutCard";
import { useWorkouts } from "@/hooks/useWorkout";
import { useExercises } from "@/hooks/useExercise";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import { useMemo } from "react";

const Workouts = () => {
  const { data, isLoading, error } = useWorkouts();
  const { data: exercises } = useExercises();
  const workouts = useMemo(() => data ?? [], [data]);
  const exerciseNameById = useMemo(
    () =>
      new Map(
        (exercises ?? []).map((exercise) => [exercise._id, exercise.title]),
      ),
    [exercises],
  );

  if (isLoading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  return (
    <Stack w="100%" mih="80vh" align="center" justify="center" px="md" py="lg">
      <Box w="100%" maw={1200}>
        <Grid my={8}>
          {workouts.map((workout) => (
            <Grid.Col key={workout.title} span={{ base: 12, sm: 6, md: 4 }}>
              <WorkoutCard
                workout={workout}
                exerciseNameById={exerciseNameById}
              />
            </Grid.Col>
          ))}
        </Grid>

        {!error && workouts.length === 0 && (
          <Text c="dimmed" ta="center">
            Nema vježbi za odabrani filter.
          </Text>
        )}
      </Box>
    </Stack>
  );
};

export default Workouts;
