import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  useFieldArray,
  useFormContext,
  Controller,
  useWatch,
} from "react-hook-form";
import { useExercises } from "../../hooks/useExercise";
import type { WorkoutFormValues } from "../../schema/workout.schema";

const ExerciseBuilder = () => {
  const { data: availableExercises } = useExercises();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<WorkoutFormValues>();
  const watchedExercises = useWatch({ control, name: "exercises" });

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "exercises",
  });

  const exerciseOptions =
    availableExercises?.map((ex) => ({
      value: ex._id,
      label: `${ex.title} (${ex.muscleGroup.replaceAll("_", " ")})`,
    })) ?? [];

  const addExercise = () => {
    append({
      exerciseId: "",
      sets: 3,
      reps: "10",
      rpe: "",
      baseXp: 50,
      progression: {
        enabled: false,
        initialWeightKg: null,
        incrementKg: 2.5,
      },
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600} size="sm">
          Vježbe u treningu
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={addExercise}
        >
          Dodaj vježbu
        </Button>
      </Group>

      {fields.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="sm">
          Nema dodanih vježbi. Kliknite "Dodaj vježbu" za početak.
        </Text>
      )}

      {fields.map((field, index) => {
        const exerciseErrors = errors.exercises?.[index];
        const isProgressionEnabled = Boolean(
          watchedExercises?.[index]?.progression?.enabled,
        );

        return (
          <Paper key={field.id} p="sm" withBorder radius="md">
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text fw={500} size="sm">
                  #{index + 1}
                </Text>
                <Group gap={4}>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => swap(index, index - 1)}
                    title="Pomakni gore"
                  >
                    <IconArrowUp size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={index === fields.length - 1}
                    onClick={() => swap(index, index + 1)}
                    title="Pomakni dolje"
                  >
                    <IconArrowDown size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => remove(index)}
                    title="Ukloni vježbu"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>

              <Controller
                control={control}
                name={`exercises.${index}.exerciseId`}
                render={({ field: selectField }) => (
                  <Select
                    label="Vježba"
                    placeholder="Odaberite vježbu"
                    data={exerciseOptions}
                    searchable
                    value={selectField.value}
                    onChange={(val) => selectField.onChange(val ?? "")}
                    error={exerciseErrors?.exerciseId?.message}
                    required
                  />
                )}
              />

              <Group grow>
                <Controller
                  control={control}
                  name={`exercises.${index}.sets`}
                  render={({ field: numField }) => (
                    <NumberInput
                      label="Serije"
                      min={1}
                      value={numField.value}
                      onChange={(val) =>
                        numField.onChange(
                          typeof val === "number" ? val : numField.value,
                        )
                      }
                      error={exerciseErrors?.sets?.message}
                      required
                    />
                  )}
                />

                <TextInput
                  label="Ponavljanja"
                  placeholder="npr. 8-12"
                  {...register(`exercises.${index}.reps`)}
                  error={exerciseErrors?.reps?.message}
                  required
                />

                <TextInput
                  label="RPE"
                  placeholder="npr. 7-8"
                  {...register(`exercises.${index}.rpe`)}
                  error={exerciseErrors?.rpe?.message}
                />

                <Controller
                  control={control}
                  name={`exercises.${index}.baseXp`}
                  render={({ field: numField }) => (
                    <NumberInput
                      label="Base XP"
                      min={0}
                      value={numField.value}
                      onChange={(val) =>
                        numField.onChange(
                          typeof val === "number" ? val : numField.value,
                        )
                      }
                      error={exerciseErrors?.baseXp?.message}
                      required
                    />
                  )}
                />
              </Group>

              <Controller
                control={control}
                name={`exercises.${index}.progression.enabled`}
                render={({ field: switchField }) => (
                  <Switch
                    label="Uključi progresiju težine"
                    checked={Boolean(switchField.value)}
                    onChange={(event) =>
                      switchField.onChange(event.currentTarget.checked)
                    }
                  />
                )}
              />

              {isProgressionEnabled && (
                <Group grow>
                  <Controller
                    control={control}
                    name={`exercises.${index}.progression.initialWeightKg`}
                    render={({ field: progressionField }) => (
                      <NumberInput
                        label="Početna težina (kg)"
                        min={0}
                        value={progressionField.value ?? undefined}
                        onChange={(value) =>
                          progressionField.onChange(
                            typeof value === "number" ? value : null,
                          )
                        }
                        error={
                          exerciseErrors?.progression?.initialWeightKg?.message
                        }
                        required
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`exercises.${index}.progression.incrementKg`}
                    render={({ field: progressionField }) => (
                      <NumberInput
                        label="Korak progresije (kg)"
                        min={0}
                        step={0.5}
                        value={progressionField.value}
                        onChange={(value) =>
                          progressionField.onChange(
                            typeof value === "number"
                              ? value
                              : progressionField.value,
                          )
                        }
                        error={
                          exerciseErrors?.progression?.incrementKg?.message
                        }
                        required
                      />
                    )}
                  />
                </Group>
              )}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default ExerciseBuilder;
