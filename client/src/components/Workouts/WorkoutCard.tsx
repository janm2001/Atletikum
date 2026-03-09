import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Overlay,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { Workout } from "@/types/Workout/workout";
import { getExerciseName, getExerciseImage } from "@/types/Workout/workout";
import { useNavigate } from "react-router-dom";
import { IconBarbell, IconLock } from "@tabler/icons-react";
import { useUser } from "@/hooks/useUser";

interface WorkoutCardProps {
  workout: Workout;
}

const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  const exerciseCount = workout.exercises.length;
  const totalSets = workout.exercises.reduce(
    (sum, exercise) => sum + (exercise.sets ?? 0),
    0,
  );
  const totalBaseXp = workout.exercises.reduce(
    (sum, exercise) => sum + (exercise.baseXp ?? 0),
    0,
  );
  const avgRpe =
    exerciseCount > 0
      ? (
          workout.exercises.reduce(
            (sum, exercise) => sum + Number(exercise.rpe ?? 0),
            0,
          ) / exerciseCount
        ).toFixed(1)
      : "0.0";

  const intensityPercent = Math.min(
    100,
    Math.max(0, (Number(avgRpe) / 10) * 100),
  );
  const navigate = useNavigate();
  const { user } = useUser();

  const isLocked = user!.level < workout.requiredLevel;

  const handleStartTraining = () => {
    if (isLocked) return;
    navigate(`/zapis-treninga/${workout._id}`, {
      state: { workout },
    });
  };

  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      h="100%"
      style={{
        position: "relative",
        opacity: isLocked ? 0.55 : 1,
        filter: isLocked ? "grayscale(0.4)" : "none",
        transition: "opacity 0.3s, filter 0.3s",
      }}
    >
      {isLocked && (
        <Overlay
          color="#000"
          backgroundOpacity={0}
          blur={0}
          radius="md"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 60,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <IconLock size={40} color="var(--mantine-color-gray-5)" />
        </Overlay>
      )}

      <Stack gap="sm" h="100%" justify="space-between">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={4}>{workout.title}</Title>
            <Text size="sm" c="dimmed" lineClamp={2} mt={2}>
              {workout.description || "Workout plan bez dodatnog opisa."}
            </Text>
          </Box>

          <Badge variant="light" color={isLocked ? "red" : "violet"}>
            Lvl {workout.requiredLevel}
          </Badge>
        </Group>

        {isLocked ? (
          <Stack gap="sm" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed" lineClamp={4}>
              {workout.description ||
                "Ovaj trening sadrži napredne vježbe za poboljšanje atletskih performansi."}
            </Text>

            <Group gap="xs">
              <Badge variant="dot" color="blue">
                {exerciseCount} vježbi
              </Badge>
              <Badge variant="dot" color="teal">
                {totalSets} setova
              </Badge>
              <Badge variant="dot" color="grape">
                {totalBaseXp} XP
              </Badge>
            </Group>

            <Divider />

            <Stack align="center" gap={4} py="sm">
              <Text size="sm" fw={600} c="dimmed" ta="center">
                Potreban Level {workout.requiredLevel} za pristup
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                Nastavite vježbati i zarađivati XP za otključavanje!
              </Text>
            </Stack>

            <Button color="gray" disabled leftSection={<IconLock size={16} />}>
              Zaključano
            </Button>
          </Stack>
        ) : (
          <>
            <Group gap="xs">
              <Badge variant="dot" color="blue">
                {exerciseCount} vježbi
              </Badge>
              <Badge variant="dot" color="teal">
                {totalSets} setova
              </Badge>
              <Badge variant="dot" color="grape">
                {totalBaseXp} XP
              </Badge>
            </Group>

            <Box>
              <Group justify="space-between" mb={6}>
                <Text size="xs" c="dimmed">
                  Prosječni intenzitet (RPE)
                </Text>
                <Text size="xs" fw={600}>
                  {avgRpe}/10
                </Text>
              </Group>
              <Progress value={intensityPercent} color="violet" radius="xl" />
            </Box>

            <Divider />

            <Stack gap={8}>
              <Text size="sm" fw={600}>
                Plan treninga
              </Text>

              {workout.exercises.slice(0, 5).map((exercise, index) => {
                const name =
                  getExerciseName(exercise.exerciseId) ?? `Vježba ${index + 1}`;
                const image = getExerciseImage(exercise.exerciseId);
                return (
                  <Group
                    key={`${typeof exercise.exerciseId === "object" ? exercise.exerciseId._id : exercise.exerciseId}-${index}`}
                    justify="space-between"
                    align="center"
                    wrap="nowrap"
                  >
                    <Group
                      gap="xs"
                      wrap="nowrap"
                      style={{ minWidth: 0, flex: 1 }}
                    >
                      <Avatar
                        src={image}
                        size={56}
                        radius="sm"
                        style={{ flexShrink: 0 }}
                      >
                        <IconBarbell size={16} />
                      </Avatar>
                      <Text size="sm" c="dimmed" truncate>
                        {name}
                      </Text>
                    </Group>
                    <Text
                      size="sm"
                      fw={500}
                      style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                    >
                      {exercise.sets} × {exercise.reps} · RPE {exercise.rpe}
                    </Text>
                  </Group>
                );
              })}

              {exerciseCount > 5 && (
                <Text size="xs" c="dimmed">
                  +{exerciseCount - 5} dodatnih vježbi
                </Text>
              )}
              <Button onClick={handleStartTraining} color="violet">
                Započni trening
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Card>
  );
};

export default WorkoutCard;
