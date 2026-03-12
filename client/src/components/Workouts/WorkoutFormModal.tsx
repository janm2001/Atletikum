import {
  Button,
  Divider,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import ActionFeedback from "@/components/Common/ActionFeedback";
import ExerciseBuilder from "@/components/Exercise/ExerciseBuilder";
import { getWorkoutTagOptions } from "@/enums/workoutTags";
import { workoutSchema, type WorkoutFormValues } from "@/schema/workout.schema";

type WorkoutFormModalProps = {
  actionError?: string | null;
  initialValues: WorkoutFormValues;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: WorkoutFormValues) => Promise<void>;
  opened: boolean;
  showRequiredLevel?: boolean;
  title: string;
};

const WorkoutFormModal = ({
  actionError,
  initialValues,
  loading = false,
  onClose,
  onSubmit,
  opened,
  showRequiredLevel = true,
  title,
}: WorkoutFormModalProps) => {
  const { t } = useTranslation();
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: initialValues,
    values: initialValues,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="xl">
      <FormProvider {...form}>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap="md">
          <ActionFeedback message={actionError} size="sm" />

          <TextInput
            label={t('training.workoutForm.titleLabel')}
            {...register("title")}
            error={errors.title?.message}
            required
          />

          <Textarea
            label={t('training.workoutForm.descriptionLabel')}
            {...register("description")}
            error={errors.description?.message}
            rows={3}
          />

          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label={t('training.workoutForm.categories')}
                placeholder={t('training.workoutForm.categoriesPlaceholder')}
                data={getWorkoutTagOptions()}
                value={field.value ?? []}
                onChange={field.onChange}
                clearable
                searchable
              />
            )}
          />

          {showRequiredLevel && (
            <Controller
              name="requiredLevel"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label={t('training.workoutForm.requiredLevel')}
                  min={1}
                  value={field.value}
                  onChange={(value) =>
                    field.onChange(
                      typeof value === "number" ? value : field.value,
                    )
                  }
                  error={errors.requiredLevel?.message}
                  required
                />
              )}
            />
          )}

          <Divider my="sm" label={t('training.workoutForm.exercises')} labelPosition="center" />

          <ExerciseBuilder />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={loading || isSubmitting}>
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </FormProvider>
    </Modal>
  );
};

export default WorkoutFormModal;
