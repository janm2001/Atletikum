import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { Workout } from "@/types/Workout/workout";
import { useNavigate } from "react-router-dom";

interface WorkoutCardProps {
  workout: Workout;
  exerciseNameById: Map<string, string>;
}

const WorkoutCard = ({ workout, exerciseNameById }: WorkoutCardProps) => {
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

  const handleStartTraining = () => {
    navigate(`/zapis-treninga/${workout._id}`, {
      state: { workout },
    });
  };

  return (
    <Card withBorder radius="md" shadow="sm" h="100%">
      <Stack gap="sm" h="100%">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={4}>{workout.title}</Title>
            <Text size="sm" c="dimmed" lineClamp={2} mt={2}>
              {workout.description || "Workout plan bez dodatnog opisa."}
            </Text>
          </Box>

          <Badge variant="light" color="violet">
            Lvl {workout.requiredLevel}
          </Badge>
        </Group>

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

          {workout.exercises.slice(0, 5).map((exercise, index) => (
            <Group
              key={`${exercise.exerciseId}-${index}`}
              justify="space-between"
              align="center"
            >
              <Text size="sm" c="dimmed">
                {exerciseNameById.get(exercise.exerciseId) ??
                  `Vježba ${index + 1}`}
              </Text>
              <Text size="sm" fw={500}>
                {exercise.sets} × {exercise.reps} · RPE {exercise.rpe}
              </Text>
            </Group>
          ))}

          {exerciseCount > 5 && (
            <Text size="xs" c="dimmed">
              +{exerciseCount - 5} dodatnih vježbi
            </Text>
          )}
          <Button onClick={handleStartTraining} color="violet">
            Započni trening
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

export default WorkoutCard;
