import { Card, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconBarbell, IconBolt, IconTrophy } from "@tabler/icons-react";
import QueryErrorMessage from "../Common/QueryErrorMessage";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useExercises } from "@/hooks/useExercise";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import { WorkoutLogCard } from "./WorkoutLogCard";
import WorkoutLogCharts from "./WorkoutLogCharts";
import { useTranslation } from "react-i18next";
import classes from "./WorkoutLogs.module.css";

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
    return <Text c="dimmed">{t("training.logs.noLogs")}</Text>;
  }

  const totalSessions = workoutLogs.length;
  const totalXp = workoutLogs.reduce(
    (sum, log) => sum + (log.totalXpGained ?? 0),
    0,
  );
  const totalPRs = workoutLogs.reduce(
    (sum, log) =>
      sum + log.completedExercises.filter((ex) => ex.isPersonalBest).length,
    0,
  );

  return (
    <Stack gap="md" mt="md" py="md">
      <SimpleGrid cols={{ base: 3 }}>
        <Card className={classes.kpiCard} radius="md">
          <Stack align="center" gap={4}>
            <IconBarbell size={20} stroke={1.5} />
            <Text className={classes.kpiValue}>{totalSessions}</Text>
            <Text className={classes.kpiLabel}>
              {t("training.logs.totalSessions")}
            </Text>
          </Stack>
        </Card>
        <Card className={classes.kpiCard} radius="md">
          <Stack align="center" gap={4}>
            <IconBolt size={20} stroke={1.5} />
            <Text className={classes.kpiValue}>{totalXp}</Text>
            <Text className={classes.kpiLabel}>
              {t("training.logs.totalXp")}
            </Text>
          </Stack>
        </Card>
        <Card className={classes.kpiCard} radius="md">
          <Stack align="center" gap={4}>
            <IconTrophy size={20} stroke={1.5} />
            <Text className={classes.kpiValue}>{totalPRs}</Text>
            <Text className={classes.kpiLabel}>
              {t("training.logs.totalPRs")}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

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
