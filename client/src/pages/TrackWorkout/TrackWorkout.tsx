import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Modal,
  NumberInput,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import type { Workout } from "@/types/Workout/workout";
import { getExerciseId, getExerciseImage } from "@/types/Workout/workout";
import { useWorkouts } from "@/hooks/useWorkout";
import { useExercises } from "@/hooks/useExercise";
import { useCreateWorkoutLog } from "@/hooks/useWorkoutLogs";
import SpinnerComponent from "@/components/SpinnerComponent/SpinnerComponent";
import { useUser } from "@/hooks/useUser";

type TrackWorkoutLocationState = {
  workout?: Workout;
};

type CompletedExercise = {
  exerciseId: string;
  weight: number;
  reps: number;
  rpe: number;
};

type TrackWorkoutFormValues = {
  sets: {
    weight: number;
    reps: number;
    rpe: number;
  }[];
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
      sets: [{ weight: 0, reps: 0, rpe: 6 }],
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

  const currentExercise = workout?.exercises[currentIndex];
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
        weight: 0,
        reps: 0,
        rpe: 6,
      })),
    });
  }, [plannedSetCount, reset]);

  const handleNextSet = async () => {
    const isCurrentSetValid = await trigger([
      `sets.${activeSetIndex}.weight`,
      `sets.${activeSetIndex}.reps`,
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

  const handleSubmitCurrentExercise = async (
    values: TrackWorkoutFormValues,
  ) => {
    if (!workout || !currentExercise) {
      return;
    }

    const trackedExerciseSets: CompletedExercise[] = values.sets.map(
      (setItem) => ({
        exerciseId: getExerciseId(currentExercise.exerciseId),
        weight: Number(setItem.weight ?? 0),
        reps: Number(setItem.reps ?? 0),
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
        workout: workout.title,
        requiredLevel: workout.requiredLevel,
        completedExercises: updatedCompletedExercises,
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
        weight: 0,
        reps: 0,
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
    <Stack w="100%" maw={1000} mx="auto" px="md" py="lg" gap="md">
      <Group justify="space-between" align="center">
        <Box>
          <Title order={2}>{workout.title}</Title>
          <Text c="dimmed">{workout.description}</Text>
        </Box>
        <Badge color="violet" variant="light">
          Lvl {workout.requiredLevel}
        </Badge>
      </Group>

      <Box>
        <Group justify="space-between" mb={8}>
          <Text size="sm" c="dimmed">
            Napredak treninga
          </Text>
          <Text size="sm" fw={600}>
            {Math.min(completedExerciseCount + 1, totalExercises)}/
            {totalExercises}
          </Text>
        </Group>
        <Progress value={progressValue} color="violet" radius="xl" />
      </Box>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="md" shadow="sm">
            <Stack gap="sm">
              <Text fw={600}>Trenutna vježba</Text>
              <Flex
                align="center"
                justify={"center"}
                direction={"column"}
                gap={16}
              >
                <Text size="lg" fw={700}>
                  {exerciseById.get(
                    getExerciseId(currentExercise?.exerciseId ?? ""),
                  )?.title ?? `Vježba ${currentIndex + 1}`}
                </Text>
                <Avatar
                  src={getExerciseImage(currentExercise?.exerciseId ?? "")}
                  size={210}
                  radius="sm"
                  style={{ flexShrink: 0 }}
                ></Avatar>
              </Flex>
              <Text size="sm" c="dimmed">
                Plan: {currentExercise?.sets} × {currentExercise?.reps} · RPE{" "}
                {currentExercise?.rpe}
              </Text>

              <form onSubmit={handleSubmit(handleSubmitCurrentExercise)}>
                <Stack gap="sm">
                  <Text size="sm" fw={600}>
                    Unesi rezultat set po set (aktivni red)
                  </Text>

                  {setFields.map((field, setIndex) => (
                    <Card key={field.id} withBorder radius="md" p="sm">
                      <Stack gap="xs">
                        <Group justify="space-between" align="center">
                          <Text size="sm" fw={600}>
                            Set {setIndex + 1}
                          </Text>
                          <Button
                            variant={
                              activeSetIndex === setIndex ? "filled" : "light"
                            }
                            size="xs"
                            color={
                              activeSetIndex === setIndex ? "violet" : "gray"
                            }
                            onClick={() => setActiveSetIndex(setIndex)}
                          >
                            {activeSetIndex === setIndex ? "Aktivan" : "Otvori"}
                          </Button>
                        </Group>

                        {activeSetIndex !== setIndex && (
                          <Text size="sm" c="dimmed">
                            Sažetak: {watchedSets?.[setIndex]?.weight ?? 0} kg ·{" "}
                            {watchedSets?.[setIndex]?.reps ?? 0} reps · RPE{" "}
                            {watchedSets?.[setIndex]?.rpe ?? 0}
                          </Text>
                        )}

                        {activeSetIndex === setIndex && (
                          <>
                            <Controller
                              control={control}
                              name={`sets.${setIndex}.weight`}
                              rules={{
                                min: {
                                  value: 0,
                                  message: "Težina ne može biti negativna",
                                },
                              }}
                              render={({ field: setField }) => (
                                <NumberInput
                                  label="Težina (kg)"
                                  min={0}
                                  value={setField.value}
                                  onChange={(value) =>
                                    setField.onChange(Number(value) || 0)
                                  }
                                  error={
                                    errors.sets?.[setIndex]?.weight?.message
                                  }
                                  required
                                />
                              )}
                            />

                            <Controller
                              control={control}
                              name={`sets.${setIndex}.reps`}
                              rules={{
                                min: {
                                  value: 1,
                                  message: "Ponavljanja moraju biti najmanje 1",
                                },
                                required: "Unesi odrađena ponavljanja",
                              }}
                              render={({ field: setField }) => (
                                <NumberInput
                                  label="Odradjena ponavljanja"
                                  min={1}
                                  value={setField.value}
                                  onChange={(value) =>
                                    setField.onChange(Number(value) || 0)
                                  }
                                  error={errors.sets?.[setIndex]?.reps?.message}
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
                                onClick={handlePreviousSet}
                                disabled={activeSetIndex === 0}
                              >
                                Prethodni set
                              </Button>

                              <Button
                                variant="light"
                                color="violet"
                                onClick={handleNextSet}
                                disabled={activeSetIndex >= plannedSetCount - 1}
                              >
                                Sljedeći set
                              </Button>
                            </Group>
                          </>
                        )}
                      </Stack>
                    </Card>
                  ))}

                  <Button
                    type="submit"
                    color="violet"
                    loading={createWorkoutLogMutation.isPending}
                  >
                    {currentIndex >= workout.exercises.length - 1
                      ? "Završi trening i spremi"
                      : "Spremi i nastavi"}
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md" shadow="sm" h="100%">
            <Stack gap="xs">
              <Text fw={600}>Vježbe u treningu</Text>
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
                    justify="space-between"
                    onClick={() =>
                      setSelectedExerciseId(getExerciseId(exercise.exerciseId))
                    }
                  >
                    <Text size="sm" fw={500}>
                      {exerciseName}
                    </Text>
                    <Text size="xs">
                      {exercise.sets} × {exercise.reps}
                    </Text>
                  </Button>
                );
              })}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

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
