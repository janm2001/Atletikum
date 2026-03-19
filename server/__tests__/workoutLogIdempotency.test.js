jest.mock("../models/WorkoutLog", () => ({
  WorkoutLog: {
    findOne: jest.fn(),
    exists: jest.fn(),
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
  syncWorkoutProgressions: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../services/weeklyChallengeService", () => ({
  updateChallengeProgress: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../utils/mongoTransaction", () => ({
  attachSession: jest.fn((operation) => operation),
  createWithSession: jest.fn(async (Model, document) => Model.create(document)),
  runInTransaction: jest.fn(async (work) => work({ id: "session-1" })),
}));

jest.mock("../utils/workoutMetrics", () => ({
  normalizeCompletedExercise: jest.fn((exercise) => exercise),
  calculateWorkoutXp: jest.fn(() => 40),
  flagPersonalBests: jest.fn((current) => current),
}));

const { WorkoutLog } = require("../models/WorkoutLog");
const { Workout } = require("../models/Workout");
const { createWorkoutLog } = require("../services/workoutLogService");
const { applyUserProgress } = require("../services/userProgressService");

describe("createWorkoutLog idempotency", () => {
  const user = { _id: "user-1", role: "user", level: 5 };
  const basePayload = {
    workoutId: "workout-1",
    completedExercises: [{ exerciseId: "exercise-1", resultValue: 8, rpe: 7 }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Workout.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "workout-1",
        title: "Test Workout",
        requiredLevel: 1,
        exercises: [{ exerciseId: "exercise-1", sets: 1, reps: "8", baseXp: 10 }],
      }),
    });
    WorkoutLog.exists.mockResolvedValue(null);
    WorkoutLog.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });
    WorkoutLog.create.mockResolvedValue({ _id: "log-1" });
    applyUserProgress.mockResolvedValue({
      user: { _id: "user-1", totalXp: 540, level: 5 },
      newAchievements: [],
    });
  });

  it("returns existing log on retry with same idempotency key", async () => {
    const existingLog = {
      _id: "log-existing",
      user: "user-1",
      workoutId: "workout-1",
      completedExercises: [{ exerciseId: "exercise-1", isPersonalBest: true }],
      totalXpGained: 40,
    };

    WorkoutLog.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(existingLog),
    });

    const result = await createWorkoutLog({
      user,
      userId: "user-1",
      payload: basePayload,
      idempotencyKey: "same-key",
    });

    expect(result.workoutLog).toEqual(existingLog);
    expect(result.newAchievements).toEqual([]);
    expect(result.totalXpGained).toBe(40);
    expect(WorkoutLog.create).not.toHaveBeenCalled();
  });

  it("creates a new log when idempotency key differs", async () => {
    WorkoutLog.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await createWorkoutLog({
      user,
      userId: "user-1",
      payload: basePayload,
      idempotencyKey: "key-1",
    });

    await createWorkoutLog({
      user,
      userId: "user-1",
      payload: basePayload,
      idempotencyKey: "key-2",
    });

    expect(WorkoutLog.create).toHaveBeenCalledTimes(2);
    expect(WorkoutLog.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ idempotencyKey: "key-1" }),
    );
    expect(WorkoutLog.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ idempotencyKey: "key-2" }),
    );
  });
});
