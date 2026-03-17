import { useMemo, useState } from "react";
import {
  Box,
  MultiSelect,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { LineChart, BarChart } from "@mantine/charts";
import {
  getCompletedExerciseLoad,
  getCompletedExerciseValue,
  type WorkoutLog,
} from "../../types/WorkoutLog/workoutLog";
import { useTranslation } from "react-i18next";

interface WorkoutLogChartsProps {
  workoutLogs: WorkoutLog[];
  exerciseNameById: Map<string, string>;
}

type ChartView = "weight" | "volume" | "frequency";

const CHART_COLORS = [
  "violet.6",
  "grape.6",
  "indigo.6",
  "blue.6",
  "teal.6",
  "orange.6",
  "cyan.6",
  "pink.6",
];

const WorkoutLogCharts = ({
  workoutLogs,
  exerciseNameById,
}: WorkoutLogChartsProps) => {
  const { t } = useTranslation();
  const [chartView, setChartView] = useState<ChartView>("weight");

  const exerciseFrequency = useMemo(() => {
    const freq = new Map<string, number>();
    for (const log of workoutLogs) {
      const seen = new Set<string>();
      for (const ex of log.completedExercises) {
        if (!seen.has(ex.exerciseId)) {
          seen.add(ex.exerciseId);
          freq.set(ex.exerciseId, (freq.get(ex.exerciseId) ?? 0) + 1);
        }
      }
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  }, [workoutLogs]);

  const exerciseOptions = useMemo(
    () =>
      exerciseFrequency.map((id) => ({
        value: id,
        label: exerciseNameById.get(id) ?? t("training.logs.unknownExercise"),
      })),
    [exerciseFrequency, exerciseNameById, t],
  );

  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const effectiveExercises = useMemo(
    () =>
      selectedExercises.length > 0
        ? selectedExercises
        : exerciseFrequency.slice(0, 3),
    [selectedExercises, exerciseFrequency],
  );

  const volumeLabel = t("training.logs.volume");
  const weekOfLabel = t("training.logs.weekOf");
  const workoutsLabel = t("training.logs.workoutsChartLabel");

  const weightData = useMemo(() => {
    if (effectiveExercises.length === 0) return [];

    const sortedLogs = [...workoutLogs].sort(
      (a, b) =>
        new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime(),
    );

    return sortedLogs
      .map((log) => {
        const dateStr = log.date
          ? new Date(log.date).toLocaleDateString("hr-HR", {
              day: "2-digit",
              month: "2-digit",
            })
          : "N/A";

        const entry: Record<string, string | number> = { date: dateStr };

        for (const exId of effectiveExercises) {
          const sets = log.completedExercises.filter(
            (s) => s.exerciseId === exId,
          );
          if (sets.length > 0) {
            const loads = sets
              .map((set) => getCompletedExerciseLoad(set))
              .filter(
                (value): value is number =>
                  value !== null && value !== undefined,
              );

            if (loads.length === 0) {
              continue;
            }

            const maxWeight = Math.max(...loads);
            const name = exerciseNameById.get(exId) ?? exId;
            entry[name] = maxWeight;
          }
        }

        return entry;
      })
      .filter((entry) => Object.keys(entry).length > 1);
  }, [workoutLogs, effectiveExercises, exerciseNameById]);

  const weightSeries = effectiveExercises.map((exId, idx) => ({
    name: exerciseNameById.get(exId) ?? exId,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  const volumeData = useMemo(() => {
    const sortedLogs = [...workoutLogs].sort(
      (a, b) =>
        new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime(),
    );

    return sortedLogs.map((log) => {
      const totalVolume = log.completedExercises.reduce((sum, ex) => {
        const load = getCompletedExerciseLoad(ex) ?? 0;

        if ((ex.metricType ?? "reps") !== "reps") {
          return sum;
        }

        return sum + load * getCompletedExerciseValue(ex);
      }, 0);
      return {
        date: log.date
          ? new Date(log.date).toLocaleDateString("hr-HR", {
              day: "2-digit",
              month: "2-digit",
            })
          : "N/A",
        [volumeLabel]: totalVolume,
      };
    });
  }, [workoutLogs, volumeLabel]);

  // --- Frequency Data ---
  const frequencyData = useMemo(() => {
    const weekMap = new Map<string, number>();
    for (const log of workoutLogs) {
      if (!log.date) continue;
      const d = new Date(log.date);
      const startOfWeek = new Date(d);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      const weekKey = startOfWeek.toLocaleDateString("hr-HR", {
        day: "2-digit",
        month: "2-digit",
      });
      weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + 1);
    }
    return [...weekMap.entries()]
      .sort(
        (a, b) => parseWeekDate(a[0]).getTime() - parseWeekDate(b[0]).getTime(),
      )
      .map(([week, count]) => ({
        [weekOfLabel]: week,
        [workoutsLabel]: count,
      }));
  }, [workoutLogs, weekOfLabel, workoutsLabel]);

  if (workoutLogs.length < 2) {
    return (
      <Paper withBorder p="md" radius="md" mb="md">
        <Text c="dimmed" ta="center" size="sm">
          {t("training.logs.minWorkoutsRequired")}
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md" mb="md">
      <Stack gap="md">
        <Title order={3}>{t("training.logs.statistics")}</Title>

        <SegmentedControl
          size="xs"
          value={chartView}
          onChange={(v) => setChartView(v as ChartView)}
          data={[
            { value: "weight", label: t("training.logs.weightProgression") },
            { value: "volume", label: t("training.logs.volume") },
            { value: "frequency", label: t("training.logs.frequency") },
          ]}
          fullWidth
        />

        {chartView === "weight" && (
          <Stack gap="sm">
            <MultiSelect
              label={t("training.logs.selectExercises")}
              placeholder={t("training.logs.selectExercisesPlaceholder")}
              data={exerciseOptions}
              value={selectedExercises}
              onChange={setSelectedExercises}
              maxValues={5}
              clearable
              searchable
            />
            {weightData.length > 0 && weightSeries.length > 0 ? (
              <Box w="100%" style={{ minWidth: 0 }}>
                <LineChart
                  h={{ base: 220, sm: 300 }}
                  data={weightData}
                  dataKey="date"
                  series={weightSeries}
                  curveType="monotone"
                  withLegend
                  legendProps={{
                    verticalAlign: "bottom",
                  }}
                  yAxisProps={{
                    width: 50,
                    domain: [0, (max: number) => Math.ceil(max * 1.15)],
                  }}
                  xAxisProps={{
                    tickMargin: 6,
                    angle: -35,
                    textAnchor: "end",
                    height: 60,
                  }}
                  tooltipAnimationDuration={200}
                  withDots
                />
              </Box>
            ) : (
              <Text c="dimmed" ta="center" size="sm">
                {t("training.logs.noDataForExercises")}
              </Text>
            )}
          </Stack>
        )}

        {chartView === "volume" && (
          <Box w="100%" style={{ minWidth: 0 }}>
            <BarChart
              h={{ base: 220, sm: 300 }}
              data={volumeData}
              dataKey="date"
              series={[{ name: volumeLabel, color: "violet.6" }]}
              withLegend
              legendProps={{
                verticalAlign: "bottom",
              }}
              yAxisProps={{
                width: 60,
                domain: [0, (max: number) => Math.ceil(max * 1.15)],
              }}
              xAxisProps={{
                tickMargin: 6,
                angle: -35,
                textAnchor: "end",
                height: 60,
              }}
              tooltipAnimationDuration={200}
              tooltipProps={{ cursor: { fill: "transparent" } }}
              barProps={{ isAnimationActive: false }}
            />
          </Box>
        )}

        {chartView === "frequency" && (
          <Box w="100%" style={{ minWidth: 0 }}>
            <BarChart
              h={{ base: 220, sm: 300 }}
              data={frequencyData}
              dataKey={weekOfLabel}
              series={[{ name: workoutsLabel, color: "grape.6" }]}
              withLegend
              legendProps={{
                verticalAlign: "bottom",
              }}
              yAxisProps={{
                domain: [0, (max: number) => Math.ceil(max * 1.15)],
                allowDecimals: false,
              }}
              xAxisProps={{
                tickMargin: 6,
                angle: -35,
                textAnchor: "end",
                height: 60,
              }}
              tooltipAnimationDuration={200}
              tooltipProps={{ cursor: { fill: "transparent" } }}
              barProps={{ isAnimationActive: false }}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

function parseWeekDate(dateStr: string): Date {
  const [day, month] = dateStr.split(".").map((s) => parseInt(s, 10));
  const now = new Date();
  return new Date(now.getFullYear(), (month ?? 1) - 1, day ?? 1);
}

export default WorkoutLogCharts;
