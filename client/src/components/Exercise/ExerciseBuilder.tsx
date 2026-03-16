import {
  ActionIcon,
  Badge,
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
import { useTranslation } from "react-i18next";
import {
  useFieldArray,
  useFormContext,
  Controller,
  useWatch,
} from "react-hook-form";
import { useExercises } from "../../hooks/useExercise";
import { useUser } from "../../hooks/useUser";
import type { WorkoutFormValues } from "../../schema/workout.schema";

const ExerciseBuilder = () => {
  const { t } = useTranslation();
  const { data: availableExercises } = useExercises();
  const { user } = useUser();
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

  const userLevel = user?.level ?? 1;
  const exerciseOptions =
    availableExercises
      ?.slice()
      .sort((a, b) => a.level - b.level)
      .map((ex) => ({
        value: ex._id,
        label: `${ex.title} (${ex.muscleGroup.replaceAll("_", " ")})`,
        disabled: ex.level > userLevel,
      })) ?? [];

  const addExercise = () => {
    append({
      exerciseId: "",
      sets: 3,
      reps: "10",
      rpe: "",
      baseXp: 20,
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
          {t('exerciseBuilder.title')}
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={addExercise}
        >
          {t('exerciseBuilder.add')}
        </Button>
      </Group>

      {fields.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="sm">
          {t('exerciseBuilder.empty')}
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
                    title={t('exerciseBuilder.moveUp')}
                  >
                    <IconArrowUp size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={index === fields.length - 1}
                    onClick={() => swap(index, index + 1)}
                    title={t('exerciseBuilder.moveDown')}
                  >
                    <IconArrowDown size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => remove(index)}
                    title={t('exerciseBuilder.remove')}
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
                    label={t('exerciseBuilder.exerciseLabel')}
                    placeholder={t('exerciseBuilder.exercisePlaceholder')}
                    data={exerciseOptions}
                    searchable
                    value={selectField.value}
                    onChange={(val) => selectField.onChange(val ?? "")}
                    error={exerciseErrors?.exerciseId?.message}
                    required
                    renderOption={({ option }) => {
                      const exercise = availableExercises?.find((e) => e._id === option.value);
                      const isAboveLevel = exercise ? exercise.level > userLevel : false;
                      return (
                        <Group gap="xs" wrap="nowrap">
                          <Text size="sm" c={isAboveLevel ? "dimmed" : undefined} style={{ flex: 1 }}>
                            {option.label}
                          </Text>
                          {exercise && (
                            <Badge size="xs" color={isAboveLevel ? "orange" : "teal"} variant="light">
                              Lv. {exercise.level}
                            </Badge>
                          )}
                        </Group>
                      );
                    }}
                  />
                )}
              />

              <Group grow>
                <Controller
                  control={control}
                  name={`exercises.${index}.sets`}
                  render={({ field: numField }) => (
                    <NumberInput
                      label={t('exerciseBuilder.sets')}
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
                  label={t('exerciseBuilder.reps')}
                  placeholder={t('exerciseBuilder.repsPlaceholder')}
                  {...register(`exercises.${index}.reps`)}
                  error={exerciseErrors?.reps?.message}
                  required
                />

                <TextInput
                  label="RPE"
                  placeholder={t('exerciseBuilder.rpePlaceholder')}
                  {...register(`exercises.${index}.rpe`)}
                  error={exerciseErrors?.rpe?.message}
                />

              </Group>

              <Controller
                control={control}
                name={`exercises.${index}.progression.enabled`}
                render={({ field: switchField }) => (
                  <Switch
                    label={t('exerciseBuilder.enableProgression')}
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
                        label={t('exerciseBuilder.initialWeight')}
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
                        label={t('exerciseBuilder.progressionStep')}
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
