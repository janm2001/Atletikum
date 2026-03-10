import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Modal,
  NumberInput,
  Progress,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import type { Workout } from "@/types/Workout/workout";
import { getExerciseId, getExerciseImage } from "@/types/Workout/workout";
import { useWorkouts } from "@/hooks/useWorkout";
import { useExercises } from "@/hooks/useExercise";
import { useCreateWorkoutLog } from "@/hooks/useWorkoutLogs";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useUser } from "@/hooks/useUser";
import type {
  CompletedExercisePayload,
  WorkoutMetricType,
} from "@/types/WorkoutLog/workoutLog";

type TrackWorkoutLocationState = {
  workout?: Workout;
};

type CompletedExercise = {
  exerciseId: string;
  metricType: WorkoutMetricType;
  unitLabel: string;
  resultValue: number;
  loadKg?: number | null;
  rpe: number;
};

type TrackWorkoutFormValues = {
  sets: {
    loadKg: number | null;
    resultValue: number;
    rpe: number;
  }[];
};

const getMetricFromPrescription = (prescription: string) => {
  const normalized = prescription.trim().toLowerCase();

  if (/(\d+(?:[.,]\d+)?)\s*(m|meter|metara|metar)$/.test(normalized)) {
    return {
      metricType: "distance" as const,
      unitLabel: "m",
      label: "Udaljenost (m)",
    };
  }

  if (/(\d+(?:[.,]\d+)?)\s*(s|sec|sek|sekundi|min|minute)$/.test(normalized)) {
    return {
      metricType: "time" as const,
      unitLabel: normalized.includes("min") ? "min" : "s",
      label: normalized.includes("min") ? "Trajanje (min)" : "Trajanje (s)",
    };
  }

  return {
    metricType: "reps" as const,
    unitLabel: "reps",
    label: "Ponavljanja",
  };
};

const TrackWorkout = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const createWorkoutLogMutation = useCreateWorkoutLog();

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<TrackWorkoutFormValues>({
    defaultValues: {
      sets: [{ loadKg: null, resultValue: 0, rpe: 6 }],
    },
  });

  const { fields: setFields } = useFieldArray({
    control,
    name: "sets",
  });

  const locationState = location.state as TrackWorkoutLocationState | null;

  const workoutFromList = useMemo(
    () => (workouts ?? []).find((item) => item._id === id),
    [workouts, id],
  );

  const workout = locationState?.workout ?? workoutFromList;

  const exerciseById = useMemo(
    () =>
      new Map((exercises ?? []).map((exercise) => [exercise._id, exercise])),
    [exercises],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<
    CompletedExercise[]
  >([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [readinessScore, setReadinessScore] = useState("3");
  const [sessionFeedbackScore, setSessionFeedbackScore] = useState("3");

  const currentExercise = workout?.exercises[currentIndex];
  const currentMetric = useMemo(
    () => getMetricFromPrescription(currentExercise?.reps ?? ""),
    [currentExercise?.reps],
  );
  const selectedExerciseDetail = selectedExerciseId
    ? exerciseById.get(selectedExerciseId)
    : undefined;

  const totalExercises = workout?.exercises.length ?? 0;
  const completedExerciseCount = currentIndex;
  const progressValue =
    totalExercises > 0 ? (completedExerciseCount / totalExercises) * 100 : 0;

  const plannedSetCount = Math.max(1, Number(currentExercise?.sets ?? 1));
  const watchedSets = useWatch({ control, name: "sets" });

  useEffect(() => {
    reset({
      sets: Array.from({ length: plannedSetCount }, () => ({
        loadKg: null,
        resultValue: 0,
        rpe: 6,
      })),
    });
  }, [plannedSetCount, reset]);

  const handleNextSet = async () => {
    const isCurrentSetValid = await trigger([
      `sets.${activeSetIndex}.loadKg`,
      `sets.${activeSetIndex}.resultValue`,
      `sets.${activeSetIndex}.rpe`,
    ]);

    if (!isCurrentSetValid) {
      return;
    }

    setActiveSetIndex((previous) =>
      Math.min(previous + 1, plannedSetCount - 1),
    );
  };

  const handlePreviousSet = () => {
    setActiveSetIndex((previous) => Math.max(previous - 1, 0));
  };

  const handleSubmitCurrentExercise: SubmitHandler<
    TrackWorkoutFormValues
  > = async (values: TrackWorkoutFormValues) => {
    if (!workout || !currentExercise) {
      return;
    }

    const trackedExerciseSets: CompletedExercise[] = values.sets.map(
      (setItem) => ({
        exerciseId: getExerciseId(currentExercise.exerciseId),
        metricType: currentMetric.metricType,
        unitLabel: currentMetric.unitLabel,
        resultValue: Number(setItem.resultValue ?? 0),
        loadKg:
          setItem.loadKg === null || setItem.loadKg === undefined
            ? null
            : Number(setItem.loadKg),
        rpe: Number(setItem.rpe ?? 0),
      }),
    );

    const updatedCompletedExercises = [
      ...completedExercises,
      ...trackedExerciseSets,
    ];
    const isLastExercise = currentIndex >= workout.exercises.length - 1;

    if (isLastExercise) {
      const result = await createWorkoutLogMutation.mutateAsync({
        workoutId: workout._id,
        completedExercises:
          updatedCompletedExercises as CompletedExercisePayload[],
        readinessScore: Number(readinessScore),
        sessionFeedbackScore: Number(sessionFeedbackScore),
      });

      if (result.user) {
        updateUser(result.user);
      }

      navigate("/slavlje", {
        replace: true,
        state: {
          type: "workout",
          xpGained: result.totalXpGained,
          title: workout.title,
          newAchievements: result.newAchievements,
          level: result.user?.level,
          totalXp: result.user?.totalXp,
          brainXp: result.user?.brainXp,
          bodyXp: result.user?.bodyXp,
        },
      });
      return;
    }

    setCompletedExercises(updatedCompletedExercises);
    setCurrentIndex((previous) => previous + 1);
    reset({
      sets: Array.from({ length: plannedSetCount }, () => ({
        loadKg: null,
        resultValue: 0,
        rpe: 6,
      })),
    });
    setActiveSetIndex(0);
  };

  if (workoutsLoading || exercisesLoading) {
    return <SpinnerComponent size="md" fullHeight={false} />;
  }

  if (!workout) {
    return (
      <Stack align="center" py="xl" gap="md">
        <Text c="dimmed">Workout nije pronađen.</Text>
        <Button variant="light" onClick={() => navigate("/zapis-treninga")}>
          Nazad
        </Button>
      </Stack>
    );
  }

  return (
    <Stack w="100%" maw={700} mx="auto" px="sm" py="md" gap="sm">
      <Group justify="space-between" align="center" wrap="nowrap">
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Title order={3} lineClamp={1}>
            {workout.title}
          </Title>
          <Text c="dimmed" size="sm" lineClamp={1}>
            {workout.description}
          </Text>
        </Box>
        <Badge color="violet" variant="light" style={{ flexShrink: 0 }}>
          Lvl {workout.requiredLevel}
        </Badge>
      </Group>

      <Box>
        <Group justify="space-between" mb={4}>
          <Text size="xs" c="dimmed">
            Napredak
          </Text>
          <Text size="xs" fw={600}>
            {Math.min(completedExerciseCount + 1, totalExercises)}/
            {totalExercises}
          </Text>
        </Group>
        <Progress value={progressValue} color="violet" radius="xl" size="sm" />
      </Box>

      <ScrollArea type="auto" offsetScrollbars scrollbarSize={6}>
        <Group gap="xs" wrap="nowrap" py={4}>
          {workout.exercises.map((exercise, index) => {
            const exerciseName =
              exerciseById.get(getExerciseId(exercise.exerciseId))?.title ??
              `Vježba ${index + 1}`;

            const isCompleted = index < completedExerciseCount;
            const isCurrent = index === currentIndex;

            return (
              <Button
                key={`${getExerciseId(exercise.exerciseId)}-${index}`}
                variant={isCurrent ? "filled" : "light"}
                color={isCompleted ? "teal" : isCurrent ? "violet" : "gray"}
                size="compact-sm"
                style={{ flexShrink: 0 }}
                onClick={() =>
                  setSelectedExerciseId(getExerciseId(exercise.exerciseId))
                }
              >
                {exerciseName.length > 14
                  ? exerciseName.slice(0, 12) + "…"
                  : exerciseName}
              </Button>
            );
          })}
        </Group>
      </ScrollArea>

      <Card withBorder radius="md" shadow="sm" p="sm">
        <Stack gap="sm">
          <Stack gap={6}>
            <Text size="sm" fw={600}>
              Spremnost za trening
            </Text>
            <SegmentedControl
              fullWidth
              value={readinessScore}
              onChange={setReadinessScore}
              data={[
                { value: "1", label: "Niska" },
                { value: "2", label: "Umorna" },
                { value: "3", label: "OK" },
                { value: "4", label: "Dobra" },
                { value: "5", label: "Top" },
              ]}
            />
          </Stack>

          <Text fw={600} size="sm">
            Trenutna vježba
          </Text>
          <Flex align="center" justify="center" direction="column" gap={12}>
            <Text size="lg" fw={700} ta="center">
              {exerciseById.get(
                getExerciseId(currentExercise?.exerciseId ?? ""),
              )?.title ?? `Vježba ${currentIndex + 1}`}
            </Text>
            <Avatar
              src={getExerciseImage(currentExercise?.exerciseId ?? "")}
              size={160}
              radius="sm"
              style={{ flexShrink: 0 }}
            />
          </Flex>
          <Text size="sm" c="dimmed" ta="center">
            Plan: {currentExercise?.sets} × {currentExercise?.reps} · RPE{" "}
            {currentExercise?.rpe}
          </Text>

          <form onSubmit={handleSubmit(handleSubmitCurrentExercise)}>
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
                    onClick={() => setActiveSetIndex(setIndex)}
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

                    {isActive && (
                      <Stack gap="xs">
                        <Controller
                          control={control}
                          name={`sets.${setIndex}.loadKg`}
                          rules={{
                            validate: (value) => {
                              if (value === null || value === undefined) {
                                return true;
                              }

                              return (
                                value >= 0 || "Težina ne može biti negativna"
                              );
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
                              error={
                                errors.sets?.[setIndex]?.resultValue?.message
                              }
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
                            onClick={handlePreviousSet}
                            disabled={activeSetIndex === 0}
                          >
                            Prethodni
                          </Button>
                          <Button
                            variant="light"
                            color="violet"
                            size="xs"
                            onClick={handleNextSet}
                            disabled={activeSetIndex >= plannedSetCount - 1}
                          >
                            Sljedeći set
                          </Button>
                        </Group>
                      </Stack>
                    )}
                  </Card>
                );
              })}

              <Button
                type="submit"
                color="violet"
                fullWidth
                loading={createWorkoutLogMutation.isPending}
                style={{ position: "sticky", bottom: 12, zIndex: 10 }}
                my={16}
              >
                {currentIndex >= workout.exercises.length - 1
                  ? "Završi trening i spremi"
                  : "Spremi i nastavi →"}
              </Button>

              <Stack gap={6}>
                <Text size="sm" fw={600}>
                  Kako je trening sjeo?
                </Text>
                <SegmentedControl
                  fullWidth
                  value={sessionFeedbackScore}
                  onChange={setSessionFeedbackScore}
                  data={[
                    { value: "1", label: "Težak" },
                    { value: "2", label: "Naporno" },
                    { value: "3", label: "Solidno" },
                    { value: "4", label: "Dobro" },
                    { value: "5", label: "Lako" },
                  ]}
                />
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Card>

      <Modal
        opened={!!selectedExerciseId}
        onClose={() => setSelectedExerciseId(null)}
        title={selectedExerciseDetail?.title ?? "Detalji vježbe"}
        centered
      >
        {selectedExerciseDetail ? (
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              {selectedExerciseDetail.description}
            </Text>
            <Group gap="xs">
              <Badge variant="dot" color="gray">
                {selectedExerciseDetail.muscleGroup}
              </Badge>
              <Badge variant="light" color="violet">
                Lvl {selectedExerciseDetail.level}
              </Badge>
            </Group>
            {selectedExerciseDetail.videoLink && (
              <Button
                component="a"
                href={selectedExerciseDetail.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                variant="light"
              >
                Pogledaj video
              </Button>
            )}
          </Stack>
        ) : (
          <Text c="dimmed">Detalji vježbe nisu dostupni.</Text>
        )}
      </Modal>
    </Stack>
  );
};

export default TrackWorkout;
