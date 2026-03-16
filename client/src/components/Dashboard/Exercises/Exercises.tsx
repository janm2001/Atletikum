import { Grid, Select, Stack, Text, Title } from "@mantine/core";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ExerciseCard from "../ExerciseCard/ExerciseCard";
import {
  getMuscleGroupOptions,
  type MuscleGroupValue,
} from "../../../enums/muscleGroup";
import SpinnerComponent from "../../SpinnerComponent/SpinnerComponent";
import { useExercises } from "@/hooks/useExercise";

const Exercises = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useExercises();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("ALL");

  const exercises = useMemo(() => data ?? [], [data]);

  const filteredExercises = useMemo(() => {
    if (selectedMuscleGroup === "ALL") {
      return exercises;
    }

    return exercises.filter(
      (exercise) =>
        exercise.muscleGroup === (selectedMuscleGroup as MuscleGroupValue),
    );
  }, [exercises, selectedMuscleGroup]);

  const visibleExercises = filteredExercises.slice(0, 3);

  if (isLoading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  return (
    <Stack gap="md" w="100%">
      <Title order={3}>{t("dashboard.exercises.title")}</Title>
      <Select
        label={t("dashboard.exercises.filterLabel")}
        data={getMuscleGroupOptions()}
        value={selectedMuscleGroup}
        onChange={(value) => setSelectedMuscleGroup(value ?? "ALL")}
        w={{ base: "100%", sm: 320 }}
      />

      {error && <Text c="red">{error.message}</Text>}

      <Grid>
        {visibleExercises.map((exercise) => (
          <Grid.Col key={exercise.title} span={{ base: 12, sm: 6, md: 4 }}>
            <ExerciseCard exercise={exercise} />
          </Grid.Col>
        ))}
      </Grid>

      {!error && visibleExercises.length === 0 && (
        <Text c="dimmed">{t("dashboard.exercises.empty")}</Text>
      )}
    </Stack>
  );
};

export default Exercises;
