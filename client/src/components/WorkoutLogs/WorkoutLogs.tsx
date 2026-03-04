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
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { useExercises } from "@/hooks/useExercise";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";

const WorkoutLogs = () => {
  const { data, isLoading, error } = useWorkoutLogs();
  const { data: exercises } = useExercises();
  const workoutLogs = data ?? [];
  const exerciseNameById = new Map(
    (exercises ?? []).map((exercise) => [exercise._id, exercise.title]),
  );

  if (isLoading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  if (error) {
    return <Text c="red">{error.message}</Text>;
  }

  if (workoutLogs.length === 0) {
    return <Text c="dimmed">Još nema spremljenih treninga.</Text>;
  }

  return (
    <Stack gap="md" mt="md">
      {workoutLogs.map((workoutLog) => (
        <Card key={workoutLog._id} withBorder radius="md" shadow="sm" h="100%">
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
                  new Set(
                    workoutLog.completedExercises.map(
                      (exercise) => exercise.exerciseId,
                    ),
                  ).size
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
                    {Array.from(
                      workoutLog.completedExercises.reduce(
                        (accumulator, completedSet) => {
                          const existing =
                            accumulator.get(completedSet.exerciseId) ?? [];
                          existing.push(completedSet);
                          accumulator.set(completedSet.exerciseId, existing);
                          return accumulator;
                        },
                        new Map<string, typeof workoutLog.completedExercises>(),
                      ),
                    ).map(([exerciseId, sets]) => (
                      <Grid.Col
                        key={exerciseId}
                        span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                      >
                        <Card withBorder radius="sm" p="sm" h="100%">
                          <Stack gap={4}>
                            <Text fw={600} size="sm">
                              {exerciseNameById.get(exerciseId) ??
                                "Nepoznata vježba"}
                            </Text>
                            <List size="xs" spacing={2}>
                              {sets.map((setItem, index) => (
                                <List.Item key={`${exerciseId}-${index}`}>
                                  Set {index + 1}: {setItem.weight} kg ×{" "}
                                  {setItem.reps} reps · RPE {setItem.rpe}
                                </List.Item>
                              ))}
                            </List>
                          </Stack>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
};

export default WorkoutLogs;
