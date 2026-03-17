import { Stack, Text } from "@mantine/core";
import QueryErrorMessage from "../Common/QueryErrorMessage";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useExercises } from "@/hooks/useExercise";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import { WorkoutLogCard } from "./WorkoutLogCard";
import WorkoutLogCharts from "./WorkoutLogCharts";
import { useTranslation } from "react-i18next";

const WorkoutLogs = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useWorkoutLogs();
  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const workoutLogs = data ?? [];
  const exerciseNameById = new Map(
    (exercises ?? []).map((exercise) => [exercise._id, exercise.title]),
  );

  if (isLoading || exercisesLoading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  if (error) {
    return <QueryErrorMessage message={error.message} />;
  }

  if (workoutLogs.length === 0) {
    return <Text c="dimmed">{t('training.logs.noLogs')}</Text>;
  }

  return (
    <Stack gap="md" mt="md">
      <WorkoutLogCharts
        workoutLogs={workoutLogs}
        exerciseNameById={exerciseNameById}
      />
      {workoutLogs.map((workoutLog) => (
        <WorkoutLogCard
          key={workoutLog._id}
          workoutLog={workoutLog}
          exerciseNameById={exerciseNameById}
        />
      ))}
    </Stack>
  );
};

export default WorkoutLogs;
