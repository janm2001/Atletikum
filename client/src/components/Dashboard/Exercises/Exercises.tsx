import { Grid, Select, Stack, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import ExerciseCard from "../ExerciseCard/ExerciseCard";
import { apiService } from "../../../utils/apiService";
import type { Exercise } from "../../../types/Exercise/exercise";
import {
  MUSCLE_GROUP_OPTIONS,
  type MuscleGroupValue,
} from "../../../enums/muscleGroup";
import SpinnerComponent from "../../SpinnerComponent/SpinnerComponent";

const Exercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("ALL");

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiService.get<{ exercises: Exercise[] }>(
          "exercises",
        );
        setExercises(response.data?.exercises ?? []);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Greška pri dohvaćanju vježbi.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    if (selectedMuscleGroup === "ALL") {
      return exercises;
    }

    return exercises.filter(
      (exercise) =>
        exercise.muscleGroup === (selectedMuscleGroup as MuscleGroupValue),
    );
  }, [exercises, selectedMuscleGroup]);

  const visibleExercises = filteredExercises.slice(0, 5);

  if (loading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  return (
    <Stack gap="md" w="100%">
      <Title order={3}>Popularne vježbe</Title>
      <Select
        label="Filtriraj po mišićnoj skupini"
        data={MUSCLE_GROUP_OPTIONS}
        value={selectedMuscleGroup}
        onChange={(value) => setSelectedMuscleGroup(value ?? "ALL")}
        w={{ base: "100%", sm: 320 }}
      />

      {error && <Text c="red">{error}</Text>}

      <Grid>
        {visibleExercises.map((exercise) => (
          <Grid.Col key={exercise.title} span={{ base: 12, sm: 6, md: 4 }}>
            <ExerciseCard exercise={exercise} />
          </Grid.Col>
        ))}
      </Grid>

      {!error && visibleExercises.length === 0 && (
        <Text c="dimmed">Nema vježbi za odabrani filter.</Text>
      )}
    </Stack>
  );
};

export default Exercises;
