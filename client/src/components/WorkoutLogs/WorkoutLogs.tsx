import { useEffect, useState } from "react";
import { Button, Card, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconBarbell, IconBolt, IconTrophy } from "@tabler/icons-react";
import QueryErrorMessage from "../Common/QueryErrorMessage";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useExercises } from "@/hooks/useExercise";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import { WorkoutLogCard } from "./WorkoutLogCard";
import WorkoutLogCharts from "./WorkoutLogCharts";
import { useTranslation } from "react-i18next";
import classes from "./WorkoutLogs.module.css";
import type { WorkoutLog } from "@/types/WorkoutLog/workoutLog";

const WorkoutLogs = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [allLogs, setAllLogs] = useState<WorkoutLog[]>([]);

  const { data, isLoading, isFetching, error } = useWorkoutLogs(page);
  const { data: exercises, isLoading: exercisesLoading } = useExercises();

  const exerciseNameById = new Map(
    (exercises ?? []).map((exercise) => [exercise._id, exercise.title]),
  );

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  useEffect(() => {
    if (!data?.logs || isFetching) return;
    if (page === 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllLogs(data.logs);
    } else {
      setAllLogs((prev) => {
        const existingIds = new Set(prev.map((l) => l._id));
        const newItems = data.logs.filter((l) => !existingIds.has(l._id));
        if (newItems.length === 0) return prev;
        return [...prev, ...newItems];
      });
    }
  }, [data?.logs, isFetching, page]);

  if (isLoading || exercisesLoading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  if (error) {
    return <QueryErrorMessage message={error.message} />;
  }

  if (allLogs.length === 0 && !isFetching) {
    return <Text c="dimmed">{t("training.logs.noLogs")}</Text>;
  }

  const totalXp = allLogs.reduce(
    (sum, log) => sum + (log.totalXpGained ?? 0),
    0,
  );
  const totalPRs = allLogs.reduce(
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
            <Text className={classes.kpiValue}>{total}</Text>
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
        workoutLogs={allLogs}
        exerciseNameById={exerciseNameById}
      />
      {allLogs.map((workoutLog) => (
        <WorkoutLogCard
          key={workoutLog._id}
          workoutLog={workoutLog}
          exerciseNameById={exerciseNameById}
        />
      ))}

      {page < totalPages && (
        <Button
          variant="outline"
          loading={isFetching}
          onClick={() => setPage((p) => p + 1)}
        >
          {t("training.logs.loadMore")}
        </Button>
      )}
    </Stack>
  );
};

export default WorkoutLogs;
