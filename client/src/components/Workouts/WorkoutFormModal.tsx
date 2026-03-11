import {
  Button,
  Divider,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import ExerciseBuilder from "@/components/Exercise/ExerciseBuilder";
import { WORKOUT_TAG_OPTIONS } from "@/enums/workoutTags";
import { workoutSchema, type WorkoutFormValues } from "@/schema/workout.schema";

type WorkoutFormModalProps = {
  actionError?: string;
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
          {actionError && (
            <Text c="red" size="sm">
              {actionError}
            </Text>
          )}

          <TextInput
            label="Naslov treninga"
            {...register("title")}
            error={errors.title?.message}
            required
          />

          <Textarea
            label="Opis treninga"
            {...register("description")}
            error={errors.description?.message}
            rows={3}
          />

          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Kategorije"
                placeholder="Odaberite kategorije"
                data={WORKOUT_TAG_OPTIONS}
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
                  label="Potrebna razina (Level)"
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

          <Divider my="sm" label="Vježbe" labelPosition="center" />

          <ExerciseBuilder />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Odustani
            </Button>
            <Button type="submit" loading={loading || isSubmitting}>
              Spremi
            </Button>
          </Group>
        </Stack>
      </FormProvider>
    </Modal>
  );
};

export default WorkoutFormModal;
