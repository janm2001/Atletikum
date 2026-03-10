const {
  parseWorkoutMetric,
  normalizeCompletedExercise,
  calculateWorkoutXp,
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
});
