import { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import useActionFeedback from "@/hooks/useActionFeedback";
import useCrudDialogState from "@/hooks/useCrudDialogState";
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
import ConfirmDeleteModal from "@/components/Common/ConfirmDeleteModal";

const getDefaultFormValues = (): WorkoutFormValues => ({
  title: "",
  description: "",
  requiredLevel: 1,
  tags: [],
  exercises: [],
});

const WorkoutTab = () => {
  const { t } = useTranslation();
  const {
    isFormOpen,
    editingId: editingWorkoutId,
    deletingId: deletingWorkoutId,
    openCreateForm,
    openEditForm,
    closeForm,
    requestDelete,
    clearDelete,
  } = useCrudDialogState();
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
    openCreateForm();
    setFormValues(getDefaultFormValues());
    clearActionError();
  };

  const handleOpenEdit = (workout: Workout) => {
    openEditForm(workout._id);
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
  };

  const handleDeleteClick = (id: string) => {
    requestDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWorkoutId) return;
    try {
      clearActionError();
      await deleteMutation.mutateAsync(deletingWorkoutId);
      notifications.show({
        color: "green",
        message: t("admin.workouts.deleteSuccess"),
      });
    } catch (error) {
      handleActionError(error, t("admin.workouts.deleteError"));
    } finally {
      clearDelete();
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
      closeForm();
      setFormValues(getDefaultFormValues());
      notifications.show({
        color: "green",
        message: t("admin.workouts.saveSuccess"),
      });
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
        onDelete={handleDeleteClick}
      />

      <ConfirmDeleteModal
        opened={!!deletingWorkoutId}
        onClose={clearDelete}
        onConfirm={handleDeleteConfirm}
        title={t("admin.workouts.deleteConfirmTitle")}
        message={t("admin.workouts.deleteConfirm")}
        loading={deleteMutation.isPending}
      />
      <WorkoutFormModal
        opened={isFormOpen}
        onClose={closeForm}
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
