import {
  Accordion,
  Badge,
  Card,
  Grid,
  Group,
  List,
  Stack,
  Text,
} from "@mantine/core";
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
              {t('training.logs.setLabel', { number: index + 1 })}: {formatCompletedExerciseResult(setItem)} · RPE{" "}
              {setItem.rpe}
              {setItem.isPersonalBest ? " · PR" : ""}
            </List.Item>
          ))}
        </List>
      </Stack>
    </Card>
  );
};

interface WorkoutLogCardProps {
  workoutLog: WorkoutLog;
  exerciseNameById: Map<string, string>;
}

export const WorkoutLogCard = ({
  workoutLog,
  exerciseNameById,
}: WorkoutLogCardProps) => {
  const { t } = useTranslation();
  const groupedExercises = Array.from(
    workoutLog.completedExercises.reduce((acc, set) => {
      const existing = acc.get(set.exerciseId) ?? [];
      existing.push(set);
      acc.set(set.exerciseId, existing);
      return acc;
    }, new Map<string, typeof workoutLog.completedExercises>()),
  );

  return (
    <Card withBorder radius="md" shadow="sm" h="100%">
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text fw={700}>{workoutLog.workout ?? t('training.logs.workout')}</Text>
          <Badge color="violet" variant="light">
            Lvl {workoutLog.requiredLevel ?? 1}
          </Badge>
        </Group>

        <Group gap="xs">
          <Badge variant="dot" color="teal">
            {
              new Set(workoutLog.completedExercises.map((ex) => ex.exerciseId))
                .size
            }{" "}
            {t('training.logs.exerciseCountLabel')}
          </Badge>
          <Badge variant="dot" color="grape">
            {workoutLog.totalXpGained ?? 0} XP
          </Badge>
          <Badge variant="dot" color="blue">
            {t('training.logs.setsCount', { count: workoutLog.completedExercises.length })}
          </Badge>
          {workoutLog.completedExercises.some(
            (exercise) => exercise.isPersonalBest,
          ) && (
            <Badge variant="light" color="orange">
              {t('training.logs.newPR')}
            </Badge>
          )}
        </Group>

        <Text size="sm" c="dimmed">
          {t('training.logs.date')}:{" "}
          {workoutLog.date
            ? new Date(workoutLog.date).toLocaleString("hr-HR")
            : "N/A"}
        </Text>

        <Accordion variant="contained" radius="sm">
          <Accordion.Item value={`details-${workoutLog._id}`}>
            <Accordion.Control>
              <Text size="sm" fw={600}>
                {t('training.logs.completedExercises')}
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Grid>
                {groupedExercises.map(([exerciseId, sets]) => (
                  <Grid.Col
                    key={exerciseId}
                    span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                  >
                    <WorkoutLogExerciseGroup
                      exerciseName={
                        exerciseNameById.get(exerciseId) ?? t('training.logs.unknownExercise')
                      }
                      sets={sets}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Card>
  );
};
