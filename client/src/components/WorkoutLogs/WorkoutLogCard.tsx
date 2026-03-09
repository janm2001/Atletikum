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
import type { WorkoutLog } from "../../hooks/useWorkoutLogs";

interface WorkoutLogExerciseGroupProps {
  exerciseName: string;
  sets: { weight: number; reps: number; rpe: number }[];
}

export const WorkoutLogExerciseGroup = ({
  exerciseName,
  sets,
}: WorkoutLogExerciseGroupProps) => {
  return (
    <Card withBorder radius="sm" p="sm" h="100%">
      <Stack gap={4}>
        <Text fw={600} size="sm">
          {exerciseName}
        </Text>
        <List size="xs" spacing={2}>
          {sets.map((setItem, index) => (
            <List.Item key={index}>
              Set {index + 1}: {setItem.weight} kg × {setItem.reps} reps · RPE{" "}
              {setItem.rpe}
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
          <Text fw={700}>{workoutLog.workout ?? "Trening"}</Text>
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
            vježbi
          </Badge>
          <Badge variant="dot" color="grape">
            {workoutLog.totalXpGained ?? 0} XP
          </Badge>
          <Badge variant="dot" color="blue">
            {workoutLog.completedExercises.length} setova
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          Datum:{" "}
          {workoutLog.date
            ? new Date(workoutLog.date).toLocaleString("hr-HR")
            : "N/A"}
        </Text>

        <Accordion variant="contained" radius="sm">
          <Accordion.Item value={`details-${workoutLog._id}`}>
            <Accordion.Control>
              <Text size="sm" fw={600}>
                Odrađene vježbe
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
                        exerciseNameById.get(exerciseId) ?? "Nepoznata vježba"
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
