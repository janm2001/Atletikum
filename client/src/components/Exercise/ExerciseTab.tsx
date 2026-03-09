import { useState } from "react";
import {
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Stack,
  TextInput,
  Textarea,
  Text,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";
import {
  useWorkouts,
  useCreateWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
} from "../../hooks/useWorkout";
import ExerciseTable from "./ExerciseTable";
import ExerciseBuilder from "./ExerciseBuilder";
import { getExerciseId } from "@/types/Workout/workout";
import type { Workout } from "@/types/Workout/workout";
import {
  workoutSchema,
  type WorkoutFormValues,
} from "../../schema/workout.schema";

const getDefaultFormValues = (): WorkoutFormValues => ({
  title: "",
  description: "",
  requiredLevel: 1,
  exercises: [],
});

const ExerciseTab = () => {
  const [opened, setOpened] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const { data: workouts, isLoading, error } = useWorkouts();
  const createMutation = useCreateWorkout();
  const updateMutation = useUpdateWorkout();
  const deleteMutation = useDeleteWorkout();

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: getDefaultFormValues(),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const handleOpenCreate = () => {
    setEditingWorkoutId(null);
    reset(getDefaultFormValues());
    setActionError("");
    setOpened(true);
  };

  const handleOpenEdit = (workout: Workout) => {
    setEditingWorkoutId(workout._id);
    reset({
      title: workout.title,
      description: workout.description,
      requiredLevel: workout.requiredLevel,
      exercises: workout.exercises.map((ex) => ({
        exerciseId: getExerciseId(ex.exerciseId),
        sets: ex.sets,
        reps: ex.reps,
        rpe: ex.rpe ?? "",
        baseXp: ex.baseXp,
      })),
    });
    setActionError("");
    setOpened(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Jeste li sigurni da želite obrisati ovaj trening?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const onSubmit = async (data: WorkoutFormValues) => {
    try {
      setActionError("");
      if (editingWorkoutId) {
        await updateMutation.mutateAsync({
          id: editingWorkoutId,
          updatedData: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setOpened(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setActionError(
        err.response?.data?.message || "Došlo je do greške prilikom spremanja.",
      );
    }
  };

  if (isLoading) return <SpinnerComponent />;
  if (error) return <Text c="red">Greška pri učitavanju treninga.</Text>;

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          Novi trening
        </Button>
      </Group>

      <ExerciseTable
        workouts={workouts || []}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editingWorkoutId ? "Uredi trening" : "Dodaj novi trening"}
        size="xl"
      >
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
              name="requiredLevel"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Potrebna razina (Level)"
                  min={1}
                  value={field.value}
                  onChange={(val) =>
                    field.onChange(typeof val === "number" ? val : field.value)
                  }
                  error={errors.requiredLevel?.message}
                  required
                />
              )}
            />

            <Divider my="sm" label="Vježbe" labelPosition="center" />

            <ExerciseBuilder />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setOpened(false)}>
                Odustani
              </Button>
              <Button
                type="submit"
                loading={
                  isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                Spremi
              </Button>
            </Group>
          </Stack>
        </FormProvider>
      </Modal>
    </>
  );
};

export default ExerciseTab;
