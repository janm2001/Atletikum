import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiService } from "../../utils/apiService";
import type { Exercise } from "../../types/Exercise/exercise";
import { MuscleGroup, type MuscleGroupValue } from "../../enums/muscleGroup";
import ExercisesTable from "./ExercisesTable";
import {
  exerciseSchema,
  type ExerciseInput,
} from "../../schema/exercise.schema";
import SpinnerComponent from "../../components/SpinnerComponent/SpinnerComponent";

const getDefaultFormValues = (): ExerciseInput => ({
  title: "",
  description: "",
  muscleGroup: MuscleGroup.QUADRICEPS,
  level: 1,
  imageLink: "",
  videoLink: "",
});

const AdminPanel = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null,
  );
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

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.get<{ exercises: Exercise[] }>(
        "exercises",
      );
      setExercises(response.data?.exercises ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Greška pri dohvaćanju vježbi.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const openCreateModal = () => {
    setEditingExerciseId(null);
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
    setOpened(true);
  };

  const handleSave = async (values: ExerciseInput) => {
    try {
      setError("");

      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        muscleGroup: values.muscleGroup,
        level: values.level,
        imageLink: values.imageLink.trim() || undefined,
        videoLink: values.videoLink.trim() || undefined,
      };

      if (editingExerciseId) {
        await apiService.patch(`exercises/${editingExerciseId}`, payload);
      } else {
        await apiService.post("exercises", payload);
      }

      setOpened(false);
      await loadExercises();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Greška pri spremanju vježbe.",
      );
    }
  };

  const handleDelete = async (exerciseId: string) => {
    const confirmed = window.confirm(
      "Jeste li sigurni da želite obrisati ovu vježbu?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await apiService.delete(`exercises/${exerciseId}`);
      await loadExercises();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Greška pri brisanju vježbe.",
      );
    }
  };

  if (loading) {
    return <SpinnerComponent />;
  }

  return (
    <Stack gap="md">
      <Title order={2}>Upravljanje</Title>

      {error && <Text c="red">{error}</Text>}

      <Tabs defaultValue="vjezbe">
        <Tabs.List>
          <Tabs.Tab value="vjezbe">Vježbe</Tabs.Tab>
          <Tabs.Tab value="edukacija">Edukacija</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="vjezbe" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Popis vježbi</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={openCreateModal}
              >
                Dodaj vježbu
              </Button>
            </Group>

            <ExercisesTable
              exercises={exercises}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="edukacija" pt="md">
          <Text c="dimmed">Edukacija modul dolazi uskoro.</Text>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editingExerciseId ? "Uredi vježbu" : "Dodaj vježbu"}
        centered
      >
        <Stack component="form" onSubmit={handleSubmit(handleSave)}>
          <TextInput
            label="Naziv"
            error={errors.title?.message}
            {...register("title")}
            required
          />
          <Textarea
            label="Opis"
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
                label="Mišićna skupina"
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
                label="Razina"
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
            label="URL slike"
            error={errors.imageLink?.message}
            {...register("imageLink")}
          />
          <TextInput
            label="URL videa"
            error={errors.videoLink?.message}
            {...register("videoLink")}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setOpened(false)}>
              Odustani
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Spremi
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default AdminPanel;
