const {
  parseWorkoutMetric,
  normalizeCompletedExercise,
  calculateWorkoutXp,
  summarizePersonalBests,
  buildNextSessionSuggestions,
} = require("../utils/workoutMetrics");

describe("workout metrics", () => {
  it("detects reps, distance, and time prescriptions", () => {
    expect(parseWorkoutMetric("8")).toEqual({
      metricType: "reps",
      unitLabel: "reps",
    });
    expect(parseWorkoutMetric("20m")).toEqual({
      metricType: "distance",
      unitLabel: "m",
    });
    expect(parseWorkoutMetric("30s")).toEqual({
      metricType: "time",
      unitLabel: "s",
    });
  });

  it("normalizes optional load without forcing weight", () => {
    const normalized = normalizeCompletedExercise(
      {
        exerciseId: "exercise-1",
        resultValue: 20,
        loadKg: null,
        rpe: 7,
      },
      {
        reps: "20m",
      },
    );

    expect(normalized.metricType).toBe("distance");
    expect(normalized.unitLabel).toBe("m");
    expect(normalized.loadKg).toBeNull();
  });

  it("calculates xp from completed coverage", () => {
    const workout = {
      exercises: [
        { exerciseId: "a", sets: 2, baseXp: 20 },
        { exerciseId: "b", sets: 4, baseXp: 40 },
      ],
    };
    const completedExercises = [
      { exerciseId: "a" },
      { exerciseId: "a" },
      { exerciseId: "b" },
      { exerciseId: "b" },
    ];

    expect(calculateWorkoutXp(workout, completedExercises)).toBe(40);
  });

  it("summarizes personal bests by exercise and metric", () => {
    const summaries = summarizePersonalBests(
      [
        {
          date: "2026-03-01T00:00:00.000Z",
          workout: "A",
          completedExercises: [
            {
              exerciseId: "exercise-1",
              metricType: "reps",
              unitLabel: "reps",
              resultValue: 6,
              loadKg: 80,
            },
          ],
        },
        {
          date: "2026-03-05T00:00:00.000Z",
          workout: "B",
          completedExercises: [
            {
              exerciseId: "exercise-1",
              metricType: "reps",
              unitLabel: "reps",
              resultValue: 6,
              loadKg: 85,
            },
            {
              exerciseId: "exercise-2",
              metricType: "distance",
              unitLabel: "m",
              resultValue: 30,
              loadKg: null,
            },
          ],
        },
      ],
      new Map([
        ["exercise-1", "Back Squat"],
        ["exercise-2", "Bounding"],
      ]),
    );

    expect(summaries[0]).toMatchObject({
      exerciseId: "exercise-1",
      exerciseName: "Back Squat",
      loadKg: 85,
      label: "Najveća težina",
    });
    expect(summaries[1]).toMatchObject({
      exerciseId: "exercise-2",
      exerciseName: "Bounding",
      bestValue: 30,
      label: "Najduža udaljenost",
    });
  });

  it("builds next-session suggestions from recent performance and readiness", () => {
    const suggestions = buildNextSessionSuggestions({
      recommendedWorkouts: [
        {
          exercises: [
            {
              exerciseId: { _id: "exercise-1", title: "Back Squat" },
              reps: "6",
            },
            {
              exerciseId: { _id: "exercise-2", title: "Bounding" },
              reps: "20m",
            },
          ],
        },
      ],
      workoutLogs: [
        {
          date: "2026-03-06T00:00:00.000Z",
          completedExercises: [
            {
              exerciseId: "exercise-1",
              metricType: "reps",
              unitLabel: "reps",
              resultValue: 6,
              loadKg: 80,
              rpe: 7,
            },
            {
              exerciseId: "exercise-2",
              metricType: "distance",
              unitLabel: "m",
              resultValue: 20,
              loadKg: null,
              rpe: 6,
            },
          ],
        },
      ],
      readinessScore: 4,
      feedbackScore: 4,
      exerciseNameById: new Map([
        ["exercise-1", "Back Squat"],
        ["exercise-2", "Bounding"],
      ]),
    });

    expect(suggestions[0]).toMatchObject({
      exerciseId: "exercise-1",
      suggestedLoadKg: 82.5,
    });
    expect(suggestions[1]).toMatchObject({
      exerciseId: "exercise-2",
      suggestedValue: 25,
    });
  });
});
