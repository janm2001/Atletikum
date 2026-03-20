import {
  Button,
  Box,
  Center,
  Chip,
  Flex,
  Grid,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import WorkoutCard from "./WorkoutCard";
import {
  useCreateCustomWorkout,
  useDeleteWorkout,
  useUpdateWorkout,
  useWorkouts,
} from "@/hooks/useWorkout";
import { useUser } from "@/hooks/useUser";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import { useCallback, useMemo, useState } from "react";
import { getWorkoutTagOptions } from "@/enums/workoutTags";
import { IconBook, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import {
  getExerciseId,
  isCustomWorkout,
  isWorkoutOwnedByUser,
  type Workout,
} from "@/types/Workout/workout";
import type { WorkoutFormValues } from "@/schema/workout.schema";
import WorkoutFormModal from "./WorkoutFormModal";
import QueryErrorMessage from "@/components/Common/QueryErrorMessage";
import ConfirmDeleteModal from "@/components/Common/ConfirmDeleteModal";

const getDefaultFormValues = (): WorkoutFormValues => ({
  title: "",
  description: "",
  requiredLevel: 1,
  tags: [],
  exercises: [],
});

const Workouts = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useWorkouts("available");
  const { user } = useUser();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [opened, setOpened] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [formValues, setFormValues] = useState<WorkoutFormValues>(
    getDefaultFormValues(),
  );
  const userLevel = user?.level ?? 1;
  const createMutation = useCreateCustomWorkout();
  const updateMutation = useUpdateWorkout();
  const deleteMutation = useDeleteWorkout();

  const workouts = useMemo(() => {
    const all = data ?? [];
    const userLevel = user?.level ?? 1;
    const filtered =
      selectedTags.length === 0
        ? all
        : all.filter((w) => selectedTags.some((tag) => w.tags?.includes(tag)));
    return [...filtered].sort((a, b) => {
      const aLocked = a.requiredLevel > userLevel ? 1 : 0;
      const bLocked = b.requiredLevel > userLevel ? 1 : 0;
      if (aLocked !== bLocked) return aLocked - bLocked;
      return a.requiredLevel - b.requiredLevel;
    });
  }, [data, selectedTags, user?.level]);

  const customWorkouts = workouts.filter((workout) => isCustomWorkout(workout));
  const globalWorkouts = workouts.filter(
    (workout) => !isCustomWorkout(workout),
  );

  const MAX_CUSTOM_WORKOUTS = 10;
  const myCustomWorkouts = customWorkouts.filter((w) =>
    isWorkoutOwnedByUser(w, user?._id),
  );
  const isAtCustomLimit = myCustomWorkouts.length >= MAX_CUSTOM_WORKOUTS;

  const handleOpenCreate = () => {
    setEditingWorkoutId(null);
    setFormValues(getDefaultFormValues());
    setActionError("");
    setOpened(true);
  };

  const handleOpenEdit = useCallback((workout: Workout) => {
    setEditingWorkoutId(workout._id);
    setFormValues({
      title: workout.title,
      description: workout.description,
      requiredLevel: workout.requiredLevel,
      tags: workout.tags ?? [],
      exercises: workout.exercises.map((exercise) => ({
        exerciseId: getExerciseId(exercise.exerciseId),
        sets: exercise.sets,
        reps: exercise.reps,
        rpe: exercise.rpe ?? "",
        baseXp: 20,
        progression: {
          enabled: Boolean(exercise.progression?.enabled),
          initialWeightKg: exercise.progression?.initialWeightKg ?? null,
          incrementKg: exercise.progression?.incrementKg ?? 2.5,
        },
      })),
    });
    setActionError("");
    setOpened(true);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setDeletingWorkoutId(id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingWorkoutId) return;
    try {
      await deleteMutation.mutateAsync(deletingWorkoutId);
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingWorkoutId(null);
    }
  }, [deleteMutation, deletingWorkoutId]);

  const handleSubmit = async (values: WorkoutFormValues) => {
    const customWorkoutValues = {
      ...values,
      requiredLevel: 1,
    };

    try {
      setActionError("");
      if (editingWorkoutId) {
        await updateMutation.mutateAsync({
          id: editingWorkoutId,
          updatedData: customWorkoutValues,
        });
      } else {
        await createMutation.mutateAsync(customWorkoutValues);
      }
      setOpened(false);
      setFormValues(getDefaultFormValues());
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setActionError(err.response?.data?.message || t("common.saveError"));
    }
  };

  if (isLoading) {
    return <SpinnerComponent fullHeight={false} size="md" />;
  }

  if (error) {
    return <QueryErrorMessage message={t("training.workouts.loadError")} />;
  }

  return (
    <Stack w="100%" mih="60vh" align="center" px="md" py="lg">
      <Box w="100%" maw={1200}>
        <Flex
          my={16}
          align="center"
          justify="space-between"
          wrap="wrap"
          gap="sm"
        >
          <Group>
            <Title order={1}>{t("training.workouts.title")}</Title>
          </Group>
          <ScrollArea type="never">
            <Chip.Group
              multiple
              value={selectedTags}
              onChange={setSelectedTags}
            >
              <Group gap="xs" wrap="nowrap">
                {getWorkoutTagOptions().map((opt) => (
                  <Chip
                    key={opt.value}
                    value={opt.value}
                    variant="outline"
                    color="violet"
                  >
                    {opt.label}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </ScrollArea>
          <Tooltip
            label={
              userLevel < 6
                ? t("training.workouts.levelRequiredTooltip")
                : isAtCustomLimit
                  ? t("training.workouts.limitReachedTooltip")
                  : undefined
            }
            disabled={userLevel >= 6 && !isAtCustomLimit}
          >
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenCreate}
              disabled={userLevel < 6 || isAtCustomLimit}
            >
              {t("training.workouts.customWorkout")}
            </Button>
          </Tooltip>
        </Flex>

        {customWorkouts.length > 0 && (
          <Stack gap="sm" my="lg">
            <Stack gap="sm">
              <Title order={3}>{t("training.workouts.myWorkouts")}</Title>
              <Text size="sm" c="dimmed">
                {t("training.workouts.privateDescription")}
              </Text>
            </Stack>
            <Grid my={0}>
              {customWorkouts.map((workout) => (
                <Grid.Col key={workout._id} span={{ base: 12, sm: 6, md: 4 }}>
                  <WorkoutCard
                    workout={workout}
                    onDelete={
                      isWorkoutOwnedByUser(workout, user?._id)
                        ? handleDeleteClick
                        : undefined
                    }
                    onEdit={
                      isWorkoutOwnedByUser(workout, user?._id)
                        ? handleOpenEdit
                        : undefined
                    }
                  />
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        )}

        <Stack gap="sm" my="lg">
          <Title order={3}>{t("training.workouts.readyWorkouts")}</Title>
          <Grid my={0}>
            {globalWorkouts.map((workout) => (
              <Grid.Col key={workout._id} span={{ base: 12, sm: 6, md: 4 }}>
                <WorkoutCard workout={workout} />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>

        {!error && workouts.length === 0 && (
          <Center py="xl" style={{ flexDirection: "column", gap: 10 }}>
            <IconBook size={48} color="gray" />
            <Text c="dimmed">{t("training.workouts.noWorkoutsForFilter")}</Text>
          </Center>
        )}

        <WorkoutFormModal
          opened={opened}
          onClose={() => setOpened(false)}
          title={
            editingWorkoutId
              ? t("training.form.editTitle")
              : t("training.form.createTitle")
          }
          actionError={actionError}
          initialValues={formValues}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          showRequiredLevel={false}
        />

        <ConfirmDeleteModal
          opened={!!deletingWorkoutId}
          onClose={() => setDeletingWorkoutId(null)}
          onConfirm={handleDeleteConfirm}
          title={t("training.workouts.deleteConfirmTitle")}
          message={t("training.workouts.confirmDelete")}
          loading={deleteMutation.isPending}
        />
      </Box>
    </Stack>
  );
};

export default Workouts;
