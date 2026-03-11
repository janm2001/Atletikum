import {
  Avatar,
  Button,
  Card,
  Flex,
  Group,
  NumberInput,
  SegmentedControl,
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

const READINESS_OPTIONS = [
  { value: "1", label: "Niska" },
  { value: "2", label: "Umorna" },
  { value: "3", label: "OK" },
  { value: "4", label: "Dobra" },
  { value: "5", label: "Top" },
];

const SESSION_FEEDBACK_OPTIONS = [
  { value: "1", label: "Težak" },
  { value: "2", label: "Naporno" },
  { value: "3", label: "Solidno" },
  { value: "4", label: "Dobro" },
  { value: "5", label: "Lako" },
];

type TrackWorkoutWorkoutCardProps = {
  activeSetIndex: number;
  currentExercise: Workout["exercises"][number];
  currentIndex: number;
  currentMetric: TrackWorkoutMetric;
  errors: FieldErrors<TrackWorkoutFormValues>;
  exerciseById: Map<string, Exercise>;
  isSubmitting: boolean;
  onNextSet: () => void;
  onPreviousSet: () => void;
  onSetActiveSetIndex: (index: number) => void;
  onSetReadinessScore: (value: string) => void;
  onSetSessionFeedbackScore: (value: string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  plannedSetCount: number;
  readinessScore: string;
  sessionFeedbackScore: string;
  setFields: { id: string }[];
  watchedSets: TrackWorkoutFormValues["sets"] | undefined;
  control: Control<TrackWorkoutFormValues>;
  totalExercises: number;
};

const TrackWorkoutWorkoutCard = ({
  activeSetIndex,
  currentExercise,
  currentIndex,
  currentMetric,
  errors,
  exerciseById,
  isSubmitting,
  onNextSet,
  onPreviousSet,
  onSetActiveSetIndex,
  onSetReadinessScore,
  onSetSessionFeedbackScore,
  onSubmit,
  plannedSetCount,
  readinessScore,
  sessionFeedbackScore,
  setFields,
  watchedSets,
  control,
  totalExercises,
}: TrackWorkoutWorkoutCardProps) => {
  const currentExerciseName =
    exerciseById.get(getExerciseId(currentExercise.exerciseId))?.title ??
    `Vježba ${currentIndex + 1}`;

  return (
    <Card withBorder radius="md" shadow="sm" p="sm">
      <Stack gap="sm">
        <Stack gap={6}>
          <Text size="sm" fw={600}>
            Spremnost za trening
          </Text>
          <SegmentedControl
            fullWidth
            value={readinessScore}
            onChange={onSetReadinessScore}
            data={READINESS_OPTIONS}
          />
        </Stack>

        <Text fw={600} size="sm">
          Trenutna vježba
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
          Plan: {currentExercise.sets} × {currentExercise.reps} · RPE{" "}
          {currentExercise.rpe}
        </Text>

        <form onSubmit={onSubmit}>
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Unesi rezultat po setovima
            </Text>

            {setFields.map((field, setIndex) => {
              const isActive = activeSetIndex === setIndex;

              return (
                <Card
                  key={field.id}
                  withBorder
                  radius="md"
                  p="xs"
                  bg={isActive ? undefined : "var(--mantine-color-gray-0)"}
                  onClick={() => onSetActiveSetIndex(setIndex)}
                  style={{ cursor: isActive ? undefined : "pointer" }}
                >
                  <Group
                    justify="space-between"
                    align="center"
                    mb={isActive ? 8 : 0}
                  >
                    <Text size="sm" fw={600}>
                      Set {setIndex + 1}
                    </Text>
                    {!isActive && (
                      <Text size="xs" c="dimmed">
                        {watchedSets?.[setIndex]?.loadKg ?? "BW"} kg ·{" "}
                        {watchedSets?.[setIndex]?.resultValue ?? 0}{" "}
                        {currentMetric.unitLabel} · RPE{" "}
                        {watchedSets?.[setIndex]?.rpe ?? 0}
                      </Text>
                    )}
                  </Group>

                  <Stack
                    gap="xs"
                    style={{ display: isActive ? undefined : "none" }}
                    aria-hidden={!isActive}
                  >
                    <Controller
                      control={control}
                      name={`sets.${setIndex}.loadKg`}
                      rules={{
                        validate: (value) => {
                          if (value === null || value === undefined) {
                            return true;
                          }

                          return value >= 0 || "Težina ne može biti negativna";
                        },
                      }}
                      render={({ field: setField }) => (
                        <NumberInput
                          label="Težina (kg, opcionalno)"
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
                          message: "Vrijednost seta mora biti najmanje 1",
                        },
                        required: "Unesi rezultat seta",
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
                          message: "RPE mora biti najmanje 1",
                        },
                        max: {
                          value: 10,
                          message: "RPE može biti najviše 10",
                        },
                        required: "Unesi RPE",
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

                    <Group justify="space-between">
                      <Button
                        variant="light"
                        color="gray"
                        size="xs"
                        onClick={onPreviousSet}
                        disabled={activeSetIndex === 0}
                      >
                        Prethodni
                      </Button>
                      <Button
                        variant="light"
                        color="violet"
                        size="xs"
                        onClick={onNextSet}
                        disabled={activeSetIndex >= plannedSetCount - 1}
                      >
                        Sljedeći set
                      </Button>
                    </Group>
                  </Stack>
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
                ? "Završi trening i spremi"
                : "Spremi i nastavi →"}
            </Button>

            <Stack gap={6}>
              <Text size="sm" fw={600}>
                Kakav je bio trening?
              </Text>
              <SegmentedControl
                fullWidth
                value={sessionFeedbackScore}
                onChange={onSetSessionFeedbackScore}
                data={SESSION_FEEDBACK_OPTIONS}
              />
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
};

export default TrackWorkoutWorkoutCard;
