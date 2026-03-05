import { Box, Flex, Grid, Stack, Text, Title } from "@mantine/core";
import WorkoutCard from "./WorkoutCard";
import { useWorkouts } from "@/hooks/useWorkout";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import { useMemo } from "react";

const Workouts = () => {
  const { data, isLoading, error } = useWorkouts();
  const workouts = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  return (
    <Stack w="100%" mih="60vh" align="center" justify="center" px="md" py="lg">
      <Box w="100%" maw={1200}>
        <Flex my={16} align="center" justify="center">
          <Title order={1}>Gotovi treninzi</Title>
        </Flex>
        <Grid my={8}>
          {workouts.map((workout) => (
            <Grid.Col key={workout.title} span={{ base: 12, sm: 6, md: 4 }}>
              <WorkoutCard workout={workout} />
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
