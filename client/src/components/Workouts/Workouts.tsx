import {
  Box,
  Flex,
  Grid,
  MultiSelect,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import WorkoutCard from "./WorkoutCard";
import { useWorkouts } from "@/hooks/useWorkout";
import { useUser } from "@/hooks/useUser";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import { useMemo, useState } from "react";
import { WORKOUT_TAG_OPTIONS } from "@/enums/workoutTags";

const Workouts = () => {
  const { data, isLoading, error } = useWorkouts();
  const { user } = useUser();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const workouts = useMemo(() => {
    const all = data ?? [];
    const filtered =
      selectedTags.length === 0
        ? all
        : all.filter((w) => selectedTags.some((tag) => w.tags?.includes(tag)));
    const userLevel = user?.level ?? 1;
    return [...filtered].sort((a, b) => {
      const aLocked = a.requiredLevel > userLevel ? 1 : 0;
      const bLocked = b.requiredLevel > userLevel ? 1 : 0;
      if (aLocked !== bLocked) return aLocked - bLocked;
      return a.requiredLevel - b.requiredLevel;
    });
  }, [data, selectedTags, user?.level]);

  if (isLoading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  return (
    <Stack w="100%" mih="60vh" align="center" justify="center" px="md" py="lg">
      <Box w="100%" maw={1200}>
        <Flex my={16} align="center" justify="space-between">
          <Title order={1}>Gotovi treninzi</Title>
          <MultiSelect
            placeholder="Sve kategorije"
            value={selectedTags}
            onChange={setSelectedTags}
            data={WORKOUT_TAG_OPTIONS}
            clearable
            searchable
            w={280}
          />
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
