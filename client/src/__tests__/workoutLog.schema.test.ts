import { describe, expect, it } from "vitest";
import { workoutLogSchema } from "../schema/workoutLog.schema";

describe("workoutLogSchema", () => {
  const validLog = {
    workoutId: "workout-1",
    completedExercises: [
      {
        exerciseId: "exercise-1",
        metricType: "reps",
        unitLabel: "reps",
        resultValue: 8,
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
  };

  it("accepts a valid log", () => {
    const result = workoutLogSchema.safeParse(validLog);
    expect(result.success).toBe(true);
  });

  it("rejects missing workoutId", () => {
    const result = workoutLogSchema.safeParse({
      ...validLog,
      workoutId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty completedExercises", () => {
    const result = workoutLogSchema.safeParse({
      ...validLog,
      completedExercises: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative load", () => {
    const result = workoutLogSchema.safeParse({
      ...validLog,
      completedExercises: [
        {
          ...validLog.completedExercises[0],
          loadKg: -5,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts bodyweight or distance entries with null load", () => {
    const result = workoutLogSchema.safeParse({
      ...validLog,
      completedExercises: [
        {
          exerciseId: "exercise-2",
          metricType: "distance",
          unitLabel: "m",
          resultValue: 25,
          loadKg: null,
          rpe: 6,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid rpe", () => {
    const result = workoutLogSchema.safeParse({
      ...validLog,
      completedExercises: [
        {
          ...validLog.completedExercises[0],
          rpe: 11,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid metric type", () => {
    const result = workoutLogSchema.safeParse({
      ...validLog,
      completedExercises: [
        {
          ...validLog.completedExercises[0],
          metricType: "weight",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});