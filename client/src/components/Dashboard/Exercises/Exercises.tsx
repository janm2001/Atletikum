import {
  Grid,
  Group,
  Pagination,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import QueryErrorMessage from "../../Common/QueryErrorMessage";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ExerciseCard from "../ExerciseCard/ExerciseCard";
import {
  getMuscleGroupOptions,
  type MuscleGroupValue,
} from "../../../enums/muscleGroup";
import SpinnerComponent from "../../SpinnerComponent/SpinnerComponent";
import { useExercises } from "@/hooks/useExercise";

const PAGE_SIZE = 9;

interface ExercisesProps {
  showAll?: boolean;
}

const Exercises = ({ showAll }: ExercisesProps) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useExercises();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("ALL");
  const [page, setPage] = useState(1);

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

  const totalPages = showAll
    ? Math.ceil(filteredExercises.length / PAGE_SIZE)
    : 1;

  const visibleExercises = showAll
    ? filteredExercises.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filteredExercises.slice(0, 3);

  if (isLoading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  return (
    <Stack gap="md" w="100%" py="md">
      <Title order={3}>{t("dashboard.exercises.title")}</Title>
      <Select
        label={t("dashboard.exercises.filterLabel")}
        data={getMuscleGroupOptions()}
        value={selectedMuscleGroup}
        onChange={(value) => {
          setSelectedMuscleGroup(value ?? "ALL");
          setPage(1);
        }}
        w={{ base: "100%", sm: 320 }}
        my="sm"
      />

      {error && <QueryErrorMessage message={error.message} />}

      <Grid>
        {visibleExercises.map((exercise) => (
          <Grid.Col key={exercise.title} span={{ base: 12, sm: 6, md: 4 }}>
            <ExerciseCard exercise={exercise} />
          </Grid.Col>
        ))}
      </Grid>

      {showAll && totalPages > 1 && (
        <Group justify="center">
          <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
            size="sm"
          />
        </Group>
      )}

      {!error && visibleExercises.length === 0 && (
        <Text c="dimmed">{t("dashboard.exercises.empty")}</Text>
      )}
    </Stack>
  );
};

export default Exercises;
