import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import ActionFeedback from "@/components/Common/ActionFeedback";
import useActionFeedback from "@/hooks/useActionFeedback";

import ExercisesTable from "./ExercisesTable";
import ConfirmDeleteModal from "@/components/Common/ConfirmDeleteModal";
import { useMemo, useState } from "react";
import {
  useCreateExercise,
  useDeleteExercise,
  useExercises,
  useUpdateExercise,
} from "@/hooks/useExercise";
import { Controller, useForm } from "react-hook-form";
import { MuscleGroup, type MuscleGroupValue } from "@/enums/muscleGroup";
import { exerciseSchema, type ExerciseInput } from "@/schema/exercise.schema";
import type { Exercise } from "@/types/Exercise/exercise";
import { zodResolver } from "@hookform/resolvers/zod";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";

const getDefaultFormValues = (): ExerciseInput => ({
  title: "",
  description: "",
  muscleGroup: MuscleGroup.QUADRICEPS,
  level: 1,
  imageLink: "",
  videoLink: "",
});

const ExerciseTab = () => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null,
  );
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);
  const { actionError, clearActionError, handleActionError } =
    useActionFeedback();
  const { data, isLoading, error } = useExercises();
  const createExerciseMutation = useCreateExercise();
  const updateExerciseMutation = useUpdateExercise();
  const deleteExerciseMutation = useDeleteExercise();

  const exercises = data ?? [];
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseInput>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: getDefaultFormValues(),
  });

  const muscleGroupOptions = useMemo(
    () =>
      Object.values(MuscleGroup).map((value) => ({
        value,
        label: value.replaceAll("_", " "),
      })),
    [],
  );

  const openCreateModal = () => {
    setEditingExerciseId(null);
    clearActionError();
    reset(getDefaultFormValues());
    setOpened(true);
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExerciseId(exercise._id);
    reset({
      title: exercise.title,
      description: exercise.description,
      muscleGroup: exercise.muscleGroup,
      level: exercise.level,
      imageLink: exercise.imageLink ?? "",
      videoLink: exercise.videoLink ?? "",
    });
    clearActionError();
    setOpened(true);
  };

  const handleSave = async (values: ExerciseInput) => {
    try {
      clearActionError();

      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        muscleGroup: values.muscleGroup,
        level: values.level,
        imageLink: values.imageLink.trim() || undefined,
        videoLink: values.videoLink.trim() || undefined,
      };

      if (editingExerciseId) {
        await updateExerciseMutation.mutateAsync({
          id: editingExerciseId,
          payload,
        });
      } else {
        await createExerciseMutation.mutateAsync(payload);
      }

      setOpened(false);
      notifications.show({
        color: "green",
        message: t("admin.exercises.saveSuccess"),
      });
    } catch (saveError) {
      handleActionError(saveError, t('admin.exercises.saveError'));
    }
  };

  const handleDeleteClick = (exerciseId: string) => {
    setDeletingExerciseId(exerciseId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExerciseId) return;
    try {
      clearActionError();
      await deleteExerciseMutation.mutateAsync(deletingExerciseId);
      notifications.show({
        color: "green",
        message: t("admin.exercises.deleteSuccess"),
      });
    } catch (deleteError) {
      handleActionError(deleteError, t('admin.exercises.deleteError'));
    } finally {
      setDeletingExerciseId(null);
    }
  };

  if (isLoading) {
    return <SpinnerComponent />;
  }
  return (
    <>
      {error && <Text c="red">{error.message}</Text>}
      <ActionFeedback message={actionError} />
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600}>{t('admin.exercises.list')}</Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            {t('admin.exercises.add')}
          </Button>
        </Group>

        <ExercisesTable
          exercises={exercises}
          onEdit={openEditModal}
          onDelete={handleDeleteClick}
        />
      </Stack>
      <ConfirmDeleteModal
        opened={!!deletingExerciseId}
        onClose={() => setDeletingExerciseId(null)}
        onConfirm={handleDeleteConfirm}
        title={t("admin.exercises.deleteConfirmTitle")}
        message={t("admin.exercises.deleteConfirm")}
        loading={deleteExerciseMutation.isPending}
      />
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editingExerciseId ? t('admin.exercises.editTitle') : t('admin.exercises.addTitle')}
        centered
      >
        <Stack component="form" onSubmit={handleSubmit(handleSave)}>
          <TextInput
            label={t('admin.exercises.name')}
            error={errors.title?.message}
            {...register("title")}
            required
          />
          <Textarea
            label={t('admin.exercises.description')}
            error={errors.description?.message}
            {...register("description")}
            minRows={3}
            required
          />
          <Controller
            control={control}
            name="muscleGroup"
            render={({ field }) => (
              <Select
                label={t('admin.exercises.muscleGroup')}
                data={muscleGroupOptions}
                value={field.value}
                onChange={(value) => {
                  if (value) {
                    field.onChange(value as MuscleGroupValue);
                  }
                }}
                error={errors.muscleGroup?.message}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="level"
            render={({ field }) => (
              <NumberInput
                label={t('admin.exercises.level')}
                min={1}
                max={100}
                value={field.value}
                onChange={(value) =>
                  field.onChange(
                    typeof value === "number" ? value : field.value,
                  )
                }
                error={errors.level?.message}
                required
              />
            )}
          />
          <TextInput
            label={t('admin.exercises.imageUrl')}
            error={errors.imageLink?.message}
            {...register("imageLink")}
          />
          <TextInput
            label={t('admin.exercises.videoUrl')}
            error={errors.videoLink?.message}
            {...register("videoLink")}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setOpened(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={
                isSubmitting ||
                createExerciseMutation.isPending ||
                updateExerciseMutation.isPending
              }
            >
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ExerciseTab;
