import { describe, expect, it } from "vitest";
import {
  buildCompletedExerciseSets,
  createDefaultSets,
  getDefaultResultFromPrescription,
  getMetricFromPrescription,
} from "../hooks/useExerciseProgression";
import { buildWorkoutCelebrationState } from "../hooks/useWorkoutCompletion";
import type { Workout } from "../types/Workout/workout";
import type { CreateWorkoutLogResult } from "../types/WorkoutLog/workoutLog";

const workout: Workout = {
  _id: "workout-1",
  title: "Strength Day",
  description: "Track lower-body progression.",
  requiredLevel: 1,
  exercises: [
    {
      exerciseId: {
        _id: "exercise-1",
        title: "Back Squat",
      },
      sets: 3,
      reps: "5",
      rpe: "8",
      baseXp: 100,
      progression: {
        enabled: true,
        initialWeightKg: 80,
        incrementKg: 2.5,
        prescribedLoadKg: 85,
      },
    },
    {
      exerciseId: {
        _id: "exercise-2",
        title: "Sprint",
      },
      sets: 2,
      reps: "100 m",
      rpe: "7",
      baseXp: 80,
    },
  ],
};

describe("track workout helpers", () => {
  it("creates at least one default set and reuses the prescribed load", () => {
    expect(createDefaultSets(0, 42)).toEqual([
      {
        loadKg: 42,
        resultValue: 0,
        rpe: 6,
      },
    ]);
  });

  it("derives the metric from the exercise prescription", () => {
    expect(getMetricFromPrescription("100 m")).toEqual({
      metricType: "distance",
      unitLabel: "m",
      label: "Udaljenost (m)",
    });
    expect(getMetricFromPrescription("2 min")).toEqual({
      metricType: "time",
      unitLabel: "min",
      label: "Trajanje (min)",
    });
    expect(getMetricFromPrescription("8")).toEqual({
      metricType: "reps",
      unitLabel: "reps",
      label: "Ponavljanja",
    });
    expect(getMetricFromPrescription("4x8")).toEqual({
      metricType: "reps",
      unitLabel: "reps",
      label: "Ponavljanja",
    });
    expect(getMetricFromPrescription("4x100 m")).toEqual({
      metricType: "distance",
      unitLabel: "m",
      label: "Udaljenost (m)",
    });
  });

  it("parses default results from prescriptions", () => {
    const repsMetric = getMetricFromPrescription("4x8");
    expect(getDefaultResultFromPrescription("4x8", repsMetric)).toBe(8);
    expect(getDefaultResultFromPrescription("8", repsMetric)).toBe(8);

    const distanceMetric = getMetricFromPrescription("100 m");
    expect(getDefaultResultFromPrescription("100 m", distanceMetric)).toBe(100);
    expect(getDefaultResultFromPrescription("4x100 m", distanceMetric)).toBe(100);

    const timeMetric = getMetricFromPrescription("30 s");
    expect(getDefaultResultFromPrescription("30 s", timeMetric)).toBe(30);
    expect(getDefaultResultFromPrescription("4x30 s", timeMetric)).toBe(30);
  });

  it("builds the completed exercise payload for the current exercise", () => {
    expect(
      buildCompletedExerciseSets({
        currentExercise: workout.exercises[0],
        currentMetric: {
          metricType: "reps",
          unitLabel: "reps",
          label: "Ponavljanja",
        },
        values: {
          sets: [
            {
              loadKg: 85,
              resultValue: 5,
              rpe: 8,
            },
            {
              loadKg: null,
              resultValue: 4,
              rpe: 9,
            },
          ],
        },
      }),
    ).toEqual([
      {
        exerciseId: "exercise-1",
        metricType: "reps",
        unitLabel: "reps",
        resultValue: 5,
        loadKg: 85,
        rpe: 8,
      },
      {
        exerciseId: "exercise-1",
        metricType: "reps",
        unitLabel: "reps",
        resultValue: 4,
        loadKg: null,
        rpe: 9,
      },
    ]);
  });

  it("builds the workout celebration state with mapped personal best names", () => {
    const result: CreateWorkoutLogResult = {
      workoutLog: {
        _id: "log-1",
        user: "user-1",
        workout: "workout-1",
        workoutId: "workout-1",
        completedExercises: [],
      },
      user: {
        _id: "user-1",
        username: "jan",
        trainingFrequency: 4,
        focus: "strength",
        level: 7,
        totalXp: 1234,
        brainXp: 234,
        bodyXp: 1000,
        dailyStreak: 5,
        longestStreak: 10,
        role: "user",
        profilePicture: "",
      },
      newAchievements: [
        {
          _id: "achievement-1",
          key: "squat-pr",
          title: "Squat PR",
          description: "New squat best",
          xpReward: 50,
          category: "performance",
          badgeIcon: "trophy",
        },
      ],
      totalXpGained: 120,
      personalBests: [
        {
          exerciseId: "exercise-1",
          metricType: "reps",
          unitLabel: "reps",
          resultValue: 5,
          loadKg: 85,
          rpe: 8,
          isPersonalBest: true,
        },
        {
          exerciseId: "missing-exercise",
          metricType: "distance",
          unitLabel: "m",
          resultValue: 100,
          loadKg: null,
          rpe: 7,
          isPersonalBest: true,
        },
      ],
    };

    expect(buildWorkoutCelebrationState(workout, result)).toEqual({
      type: "workout",
      xpGained: 120,
      title: "Strength Day",
      newAchievements: result.newAchievements,
      level: 7,
      totalXp: 1234,
      brainXp: 234,
      bodyXp: 1000,
      personalBests: [
        {
          exerciseId: "exercise-1",
          metricType: "reps",
          unitLabel: "reps",
          resultValue: 5,
          loadKg: 85,
          rpe: 8,
          isPersonalBest: true,
          exerciseName: "Back Squat",
        },
        {
          exerciseId: "missing-exercise",
          metricType: "distance",
          unitLabel: "m",
          resultValue: 100,
          loadKg: null,
          rpe: 7,
          isPersonalBest: true,
          exerciseName: undefined,
        },
      ],
    });
  });
});
