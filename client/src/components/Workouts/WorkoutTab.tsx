import { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import useActionFeedback from "@/hooks/useActionFeedback";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import {
  useWorkouts,
  useCreateWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
} from "../../hooks/useWorkout";
import { getExerciseId } from "@/types/Workout/workout";
import type { Workout } from "@/types/Workout/workout";
import { type WorkoutFormValues } from "../../schema/workout.schema";
import ExerciseTable from "../Exercise/ExerciseTable";
import WorkoutFormModal from "./WorkoutFormModal";

const getDefaultFormValues = (): WorkoutFormValues => ({
  title: "",
  description: "",
  requiredLevel: 1,
  tags: [],
  exercises: [],
});

const WorkoutTab = () => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const { actionError, clearActionError, handleActionError } =
    useActionFeedback();
  const [formValues, setFormValues] = useState<WorkoutFormValues>(
    getDefaultFormValues(),
  );

  const { data: workouts, isLoading, error } = useWorkouts("global");
  const createMutation = useCreateWorkout();
  const updateMutation = useUpdateWorkout();
  const deleteMutation = useDeleteWorkout();

  const handleOpenCreate = () => {
    setEditingWorkoutId(null);
    setFormValues(getDefaultFormValues());
    clearActionError();
    setOpened(true);
  };

  const handleOpenEdit = (workout: Workout) => {
    setEditingWorkoutId(workout._id);
    setFormValues({
      title: workout.title,
      description: workout.description,
      requiredLevel: workout.requiredLevel,
      tags: workout.tags ?? [],
      exercises: workout.exercises.map((ex) => ({
        exerciseId: getExerciseId(ex.exerciseId),
        sets: ex.sets,
        reps: ex.reps,
        rpe: ex.rpe ?? "",
        baseXp: ex.baseXp,
        progression: {
          enabled: Boolean(ex.progression?.enabled),
          initialWeightKg: ex.progression?.initialWeightKg ?? null,
          incrementKg: ex.progression?.incrementKg ?? 2.5,
        },
      })),
    });
    clearActionError();
    setOpened(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('admin.workouts.deleteConfirm'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const onSubmit = async (data: WorkoutFormValues) => {
    try {
      clearActionError();
      if (editingWorkoutId) {
        await updateMutation.mutateAsync({
          id: editingWorkoutId,
          updatedData: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setOpened(false);
      setFormValues(getDefaultFormValues());
    } catch (error: unknown) {
      handleActionError(error, t('admin.workouts.saveError'));
    }
  };

  if (isLoading) return <SpinnerComponent />;
  if (error) return <Text c="red">{t('admin.workouts.loadError')}</Text>;

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          {t('admin.workouts.add')}
        </Button>
      </Group>

      <ExerciseTable
        workouts={workouts || []}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <WorkoutFormModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editingWorkoutId ? t('admin.workouts.editTitle') : t('admin.workouts.addTitle')}
        actionError={actionError}
        initialValues={formValues}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={onSubmit}
        showRequiredLevel
      />
    </>
  );
};

export default WorkoutTab;
