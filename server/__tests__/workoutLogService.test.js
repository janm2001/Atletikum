jest.mock("../models/WorkoutLog", () => ({
  WorkoutLog: {
    find: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../models/Workout", () => ({
  Workout: {
    findById: jest.fn(),
  },
}));

jest.mock("../services/userProgressService", () => ({
  applyUserProgress: jest.fn(),
}));

jest.mock("../services/progressionService", () => ({
  syncWorkoutProgressions: jest.fn(),
}));

jest.mock("../utils/workoutMetrics", () => ({
  normalizeCompletedExercise: jest.fn(),
  calculateWorkoutXp: jest.fn(),
  flagPersonalBests: jest.fn(),
}));

const { WorkoutLog } = require("../models/WorkoutLog");
const { Workout } = require("../models/Workout");
const { applyUserProgress } = require("../services/userProgressService");
const { syncWorkoutProgressions } = require("../services/progressionService");
const {
  normalizeCompletedExercise,
  calculateWorkoutXp,
  flagPersonalBests,
} = require("../utils/workoutMetrics");
const workoutLogService = require("../services/workoutLogService");

const createSelectQuery = (value) => ({
  select: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(value),
  }),
});

describe("workoutLogService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a workout log and applies body XP progress", async () => {
    Workout.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "workout-1",
        title: "Power Session",
        requiredLevel: 2,
        exercises: [
          { exerciseId: "exercise-1", reps: "6", sets: 2, baseXp: 40 },
        ],
      }),
    });
    normalizeCompletedExercise.mockReturnValue({
      exerciseId: "exercise-1",
      resultValue: 6,
      loadKg: 100,
      rpe: 7,
      isPersonalBest: false,
    });
    WorkoutLog.find.mockReturnValue(createSelectQuery([]));
    flagPersonalBests.mockReturnValue([
      {
        exerciseId: "exercise-1",
        resultValue: 6,
        loadKg: 100,
        rpe: 7,
        isPersonalBest: true,
      },
    ]);
    calculateWorkoutXp.mockReturnValue(40);
    WorkoutLog.create.mockResolvedValue({ _id: "log-1" });
    applyUserProgress.mockResolvedValue({
      user: { _id: "user-1", bodyXp: 140 },
      newAchievements: [{ key: "first-log" }],
    });

    const result = await workoutLogService.createWorkoutLog({
      user: { _id: "user-1", level: 3 },
      payload: {
        workoutId: "workout-1",
        completedExercises: [
          { exerciseId: "exercise-1", resultValue: 6, rpe: 7 },
        ],
      },
    });

    expect(WorkoutLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user-1",
        workoutId: "workout-1",
        totalXpGained: 40,
      }),
    );
    expect(syncWorkoutProgressions).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
      }),
    );
    expect(applyUserProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        bodyXp: 40,
        shouldUpdateStreak: true,
        shouldUnlockAchievements: true,
      }),
    );
    expect(result.personalBests).toEqual([
      expect.objectContaining({
        exerciseId: "exercise-1",
        isPersonalBest: true,
      }),
    ]);
  });

  it("rejects a private workout owned by another user", async () => {
    Workout.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "workout-1",
        title: "Private Session",
        requiredLevel: 1,
        createdBy: "owner-1",
        exercises: [
          { exerciseId: "exercise-1", reps: "5", sets: 3, baseXp: 30 },
        ],
      }),
    });

    await expect(
      workoutLogService.createWorkoutLog({
        user: { _id: "user-1", role: "user", level: 2 },
        payload: {
          workoutId: "workout-1",
          completedExercises: [
            { exerciseId: "exercise-1", resultValue: 5, rpe: 7 },
          ],
        },
      }),
    ).rejects.toThrow("Workout nije pronađen.");
  });
});
