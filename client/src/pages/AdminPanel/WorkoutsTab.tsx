import { useState } from "react";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  TextInput,
  Textarea,
  Text,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useForm, Controller } from "react-hook-form";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";
import {
  useWorkouts,
  useCreateWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
} from "../../hooks/useWorkout";
import WorkoutsTable from "./WorkoutsTable";
import type { Workout } from "@/types/Workout/workout";

interface WorkoutFormValues {
  title: string;
  description: string;
  requiredLevel: number;
}

const getDefaultFormValues = (): WorkoutFormValues => ({
  title: "",
  description: "",
  requiredLevel: 1,
});

const WorkoutsTab = () => {
  const [opened, setOpened] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const { data: workouts, isLoading, error } = useWorkouts();
  const createMutation = useCreateWorkout();
  const updateMutation = useUpdateWorkout();
  const deleteMutation = useDeleteWorkout();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<WorkoutFormValues>({
    defaultValues: getDefaultFormValues(),
  });

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
        await createMutation.mutateAsync({ ...data, exercises: [] }); // Start with empty exercises
      }
      setOpened(false);
    } catch (err: any) {
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

      <WorkoutsTable
        workouts={workouts || []}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editingWorkoutId ? "Uredi trening" : "Dodaj novi trening"}
        size="lg"
      >
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap="md">
          {actionError && (
            <Text c="red" size="sm">
              {actionError}
            </Text>
          )}

          <TextInput
            label="Naslov treninga"
            {...register("title", { required: true })}
            required
          />

          <Textarea
            label="Opis treninga"
            {...register("description")}
            rows={3}
          />

          <Controller
            name="requiredLevel"
            control={control}
            rules={{ required: true, min: 1 }}
            render={({ field }) => (
              <NumberInput
                label="Potrebna razina (Level)"
                min={1}
                {...field}
                required
              />
            )}
          />

          <Text size="sm" c="dimmed" mt="xs">
            Napomena: Za dodavanje ili uređivanje pojedinačnih vježbi unutar
            treninga, potrebno je pristupiti naprednom uređivaču u bazi, ili
            ćemo tu opciju dodati kasnije.
          </Text>

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
      </Modal>
    </>
  );
};

export default WorkoutsTab;
