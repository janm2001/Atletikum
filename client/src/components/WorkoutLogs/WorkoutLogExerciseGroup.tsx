import { Card, List, Stack, Text } from "@mantine/core";
import {
  formatCompletedExerciseResult,
  type WorkoutLog,
} from "../../types/WorkoutLog/workoutLog";
import { useTranslation } from "react-i18next";

interface WorkoutLogExerciseGroupProps {
  exerciseName: string;
  sets: WorkoutLog["completedExercises"];
}

export const WorkoutLogExerciseGroup = ({
  exerciseName,
  sets,
}: WorkoutLogExerciseGroupProps) => {
  const { t } = useTranslation();
  return (
    <Card withBorder radius="sm" p="sm" h="100%">
      <Stack gap={4}>
        <Text fw={600} size="sm">
          {exerciseName}
        </Text>
        <List size="xs" spacing={2}>
          {sets.map((setItem, index) => (
            <List.Item key={index}>
              {t("training.logs.setLabel", { number: index + 1 })}:{" "}
              {formatCompletedExerciseResult(setItem)} · RPE {setItem.rpe}
              {setItem.isPersonalBest
                ? ` · ${t("training.logs.personalBest")}`
                : ""}
            </List.Item>
          ))}
        </List>
      </Stack>
    </Card>
  );
};
