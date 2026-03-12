import {
  Avatar,
  Button,
  Card,
  Flex,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import {
  getExerciseId,
  getExerciseImage,
  type Workout,
} from "@/types/Workout/workout";
import type { Exercise } from "@/types/Exercise/exercise";
import type {
  TrackWorkoutFormValues,
  TrackWorkoutMetric,
} from "@/types/Workout/trackWorkout";
import { useTranslation } from "react-i18next";

type TrackWorkoutWorkoutCardProps = {
  currentExercise: Workout["exercises"][number];
  currentIndex: number;
  currentMetric: TrackWorkoutMetric;
  errors: FieldErrors<TrackWorkoutFormValues>;
  exerciseById: Map<string, Exercise>;
  isSubmitting: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  plannedSetCount: number;
  setFields: { id: string }[];
  watchedSets: TrackWorkoutFormValues["sets"] | undefined;
  control: Control<TrackWorkoutFormValues>;
  totalExercises: number;
};

const TrackWorkoutWorkoutCard = ({
  currentExercise,
  currentIndex,
  currentMetric,
  errors,
  exerciseById,
  isSubmitting,
  onSubmit,
  setFields,
  watchedSets,
  control,
  totalExercises,
}: TrackWorkoutWorkoutCardProps) => {
  const { t } = useTranslation();
  const currentExerciseName =
    exerciseById.get(getExerciseId(currentExercise.exerciseId))?.title ??
    t('training.track.exerciseFallback', { index: currentIndex + 1 });

  return (
    <Card withBorder radius="md" shadow="sm" p="sm">
      <Stack gap="sm">
        <Text fw={600} size="sm">
          {t('training.track.currentExercise')}
        </Text>
        <Flex align="center" justify="center" direction="column" gap={12}>
          <Text size="lg" fw={700} ta="center">
            {currentExerciseName}
          </Text>
          <Avatar
            src={getExerciseImage(currentExercise.exerciseId)}
            size={160}
            radius="sm"
            style={{ flexShrink: 0 }}
          />
        </Flex>
        <Text size="sm" c="dimmed" ta="center">
          {t('training.track.plan')}: {currentExercise.sets} × {currentExercise.reps} · RPE{" "}
          {currentExercise.rpe}
        </Text>
        {currentExercise.progression?.enabled && (
          <Text size="sm" c="teal" ta="center" fw={600}>
            {t('training.track.targetWeight')}:{" "}
            {currentExercise.progression.prescribedLoadKg ??
              currentExercise.progression.initialWeightKg ??
              0}{" "}
            kg
          </Text>
        )}

        <form onSubmit={onSubmit}>
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              {t('training.track.enterSetResults')}
            </Text>

            {setFields.map((field, setIndex) => {
              return (
                <Card key={field.id} withBorder radius="md" p="xs">
                  <Group justify="space-between" align="center" mb={8}>
                    <Text size="sm" fw={600}>
                      {t('training.track.setNumber', { number: setIndex + 1 })}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {watchedSets?.[setIndex]?.loadKg ?? "BW"} kg ·{" "}
                      {watchedSets?.[setIndex]?.resultValue ?? 0}{" "}
                      {currentMetric.unitLabel} · RPE{" "}
                      {watchedSets?.[setIndex]?.rpe ?? 0}
                    </Text>
                  </Group>

                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
                    <Controller
                      control={control}
                      name={`sets.${setIndex}.loadKg`}
                      rules={{
                        validate: (value) => {
                          if (value === null || value === undefined) {
                            return true;
                          }

                          return value >= 0 || t('training.track.weightNonNegative');
                        },
                      }}
                      render={({ field: setField }) => (
                        <NumberInput
                          label={t('training.track.weightOptional')}
                          min={0}
                          size="sm"
                          value={setField.value ?? undefined}
                          onChange={(value) =>
                            setField.onChange(
                              typeof value === "number" ? value : null,
                            )
                          }
                          error={errors.sets?.[setIndex]?.loadKg?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name={`sets.${setIndex}.resultValue`}
                      rules={{
                        min: {
                          value: 1,
                          message: t('training.track.setMinValue'),
                        },
                        required: t('training.track.enterSetResult'),
                      }}
                      render={({ field: setField }) => (
                        <NumberInput
                          label={currentMetric.label}
                          min={1}
                          size="sm"
                          value={setField.value}
                          onChange={(value) =>
                            setField.onChange(Number(value) || 0)
                          }
                          error={errors.sets?.[setIndex]?.resultValue?.message}
                          required
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name={`sets.${setIndex}.rpe`}
                      rules={{
                        min: {
                          value: 1,
                          message: t('training.track.rpeMin'),
                        },
                        max: {
                          value: 10,
                          message: t('training.track.rpeMax'),
                        },
                        required: t('training.track.enterRpe'),
                      }}
                      render={({ field: setField }) => (
                        <NumberInput
                          label="RPE"
                          min={1}
                          max={10}
                          size="sm"
                          value={setField.value}
                          onChange={(value) =>
                            setField.onChange(Number(value) || 1)
                          }
                          error={errors.sets?.[setIndex]?.rpe?.message}
                          required
                        />
                      )}
                    />
                  </SimpleGrid>
                </Card>
              );
            })}

            <Button
              type="submit"
              loading={isSubmitting}
              style={{ position: "sticky", bottom: 12, zIndex: 10 }}
              my={16}
            >
              {currentIndex >= totalExercises - 1
                ? t('training.track.finishAndSave')
                : t('training.track.saveAndContinue')}
            </Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
};

export default TrackWorkoutWorkoutCard;
