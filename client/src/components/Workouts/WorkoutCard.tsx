import {
  ActionIcon,
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
import {
  getExerciseName,
  getExerciseImage,
  isCustomWorkout,
} from "@/types/Workout/workout";
import { useNavigate } from "react-router-dom";
import {
  IconBarbell,
  IconEdit,
  IconLock,
  IconTrash,
} from "@tabler/icons-react";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "react-i18next";

interface WorkoutCardProps {
  workout: Workout;
  onDelete?: (id: string) => void;
  onEdit?: (workout: Workout) => void;
}

const WorkoutCard = ({ workout, onDelete, onEdit }: WorkoutCardProps) => {
  const { t } = useTranslation();
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

  const customWorkout = isCustomWorkout(workout);
  const isLocked = !customWorkout && user!.level < workout.requiredLevel;

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
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}

      <Stack gap="sm" h="100%" justify="space-between">
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Title order={4}>{workout.title}</Title>
            <Text size="sm" c="dimmed" lineClamp={2} mt={2}>
              {workout.description || t('training.workouts.noDescription')}
            </Text>
          </Box>

          {customWorkout ? (
            <Badge variant="light" color="teal" style={{ flexShrink: 0 }}>
              {t('training.workouts.customWorkout')}
            </Badge>
          ) : (
            <Badge
              variant="light"
              color={isLocked ? "red" : "violet"}
              style={{ flexShrink: 0 }}
            >
              Lvl {workout.requiredLevel}
            </Badge>
          )}
        </Group>

        {customWorkout && (
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {t('training.workouts.customWorkoutNote')}
            </Text>
            {(onEdit || onDelete) && (
              <Group gap={6}>
                {onEdit && (
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => onEdit(workout)}
                    aria-label={t('training.form.editTitle')}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                )}
                {onDelete && (
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => onDelete(workout._id)}
                    aria-label={t('common.deleteWorkout')}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            )}
          </Group>
        )}

        {isLocked ? (
          <Stack gap="sm" style={{ flex: 1 }} justify="space-between">
            <Group gap="xs">
              <Badge variant="dot" color="blue">
                {t('training.workouts.exerciseCount', { count: exerciseCount })}
              </Badge>
              <Badge variant="dot" color="teal">
                {t('training.workouts.setsCount', { count: totalSets })}
              </Badge>
              <Badge variant="dot" color="grape">
                {totalBaseXp} XP
              </Badge>
            </Group>

            <Stack align="center" gap={4} py="sm">
              <IconLock size={36} color="var(--mantine-color-gray-5)" />
              <Text size="sm" fw={600} c="dimmed" ta="center">
                {t('training.workouts.levelRequired', { level: workout.requiredLevel })}
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                {t('training.workouts.keepTraining')}
              </Text>
            </Stack>

            <Button color="gray" disabled leftSection={<IconLock size={16} />}>
              {t('training.workouts.locked')}
            </Button>
          </Stack>
        ) : (
          <>
            <Group gap="xs">
              <Badge variant="dot" color="blue">
                {t('training.workouts.exerciseCount', { count: exerciseCount })}
              </Badge>
              <Badge variant="dot" color="teal">
                {t('training.workouts.setsCount', { count: totalSets })}
              </Badge>
              <Badge variant="dot" color="grape">
                {totalBaseXp} XP
              </Badge>
            </Group>

            <Box>
              <Group justify="space-between" mb={6}>
                <Text size="xs" c="dimmed">
                  {t('training.workouts.avgIntensity')}
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
                {t('training.workouts.workoutPlan')}
              </Text>

              {workout.exercises.slice(0, 5).map((exercise, index) => {
                const name =
                  getExerciseName(exercise.exerciseId) ?? t('training.workouts.exerciseFallback', { index: index + 1 });
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
                      {exercise.sets} × {exercise.reps}
                      {exercise.progression?.enabled
                        ? ` · ${exercise.progression.prescribedLoadKg ?? exercise.progression.initialWeightKg ?? 0} kg`
                        : ` · RPE ${exercise.rpe}`}
                    </Text>
                  </Group>
                );
              })}

              {exerciseCount > 5 && (
                <Text size="xs" c="dimmed">
                  {t('training.workouts.moreExercises', { count: exerciseCount - 5 })}
                </Text>
              )}
              <Button onClick={handleStartTraining} color="violet">
                {t('training.workouts.startWorkout')}
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Card>
  );
};

export default WorkoutCard;
