jest.mock("../models/ExerciseProgression", () => {
  const ExerciseProgression = jest.fn(function ExerciseProgression(document) {
    Object.assign(this, document);
  });

  ExerciseProgression.find = jest.fn();

  return { ExerciseProgression };
});

jest.mock("../utils/mongoTransaction", () => ({
  attachSession: jest.fn((operation, session) => {
    if (!session || !operation || typeof operation.session !== "function") {
      return operation;
    }

    return operation.session(session);
  }),
  saveWithSession: jest.fn().mockResolvedValue(undefined),
}));

const { ExerciseProgression } = require("../models/ExerciseProgression");
const { attachSession, saveWithSession } = require("../utils/mongoTransaction");
const { syncWorkoutProgressions } = require("../services/progressionService");

const createFindQuery = (value) => ({
  session: jest.fn().mockResolvedValue(value),
});

describe("progressionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists updated and newly created progression records with the workout session", async () => {
    const existingRecord = {
      _id: "progression-1",
      workoutId: "workout-1",
      exerciseId: "exercise-1",
      currentTargetKg: 100,
      incrementKg: 2.5,
      lastSuccessfulLoadKg: 95,
      lastCompletedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    const findQuery = createFindQuery([existingRecord]);

    ExerciseProgression.find.mockReturnValue(findQuery);

    const session = { id: "session-1" };

    await syncWorkoutProgressions({
      userId: "user-1",
      workout: {
        _id: "workout-1",
        exercises: [
          {
            exerciseId: "exercise-1",
            reps: "6",
            sets: 2,
            progression: {
              enabled: true,
              initialWeightKg: 90,
              incrementKg: 2.5,
            },
          },
          {
            exerciseId: "exercise-2",
            reps: "8",
            sets: 3,
            progression: {
              enabled: true,
              initialWeightKg: 60,
              incrementKg: 2.5,
            },
          },
        ],
      },
      completedExercises: [
        { exerciseId: "exercise-1", loadKg: 100, resultValue: 6 },
        { exerciseId: "exercise-1", loadKg: 100, resultValue: 6 },
        { exerciseId: "exercise-2", loadKg: 60, resultValue: 8 },
        { exerciseId: "exercise-2", loadKg: 60, resultValue: 8 },
        { exerciseId: "exercise-2", loadKg: 60, resultValue: 8 },
      ],
      session,
    });

    expect(ExerciseProgression.find).toHaveBeenCalledWith({
      userId: "user-1",
      workoutId: "workout-1",
      exerciseId: { $in: ["exercise-1", "exercise-2"] },
    });
    expect(attachSession).toHaveBeenCalledWith(findQuery, session);
    expect(findQuery.session).toHaveBeenCalledWith(session);

    expect(existingRecord).toEqual(
      expect.objectContaining({
        currentTargetKg: 102.5,
        incrementKg: 2.5,
        lastSuccessfulLoadKg: 100,
        lastCompletedAt: expect.any(Date),
      }),
    );
    expect(saveWithSession).toHaveBeenCalledTimes(2);
    expect(saveWithSession).toHaveBeenNthCalledWith(1, existingRecord, session);
    expect(ExerciseProgression).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        workoutId: "workout-1",
        exerciseId: "exercise-2",
        currentTargetKg: 62.5,
        incrementKg: 2.5,
        lastSuccessfulLoadKg: 60,
        lastCompletedAt: expect.any(Date),
      }),
    );
    expect(saveWithSession).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        userId: "user-1",
        workoutId: "workout-1",
        exerciseId: "exercise-2",
        currentTargetKg: 62.5,
        incrementKg: 2.5,
        lastSuccessfulLoadKg: 60,
        lastCompletedAt: expect.any(Date),
      }),
      session,
    );
  });

  it("skips the bulk save when no valid progression writes were produced", async () => {
    const findQuery = createFindQuery([]);

    ExerciseProgression.find.mockReturnValue(findQuery);

    await syncWorkoutProgressions({
      userId: "user-1",
      workout: {
        _id: "workout-1",
        exercises: [
          {
            exerciseId: "exercise-1",
            reps: "AMRAP",
            sets: 2,
            progression: {
              enabled: true,
              initialWeightKg: 50,
              incrementKg: 2.5,
            },
          },
        ],
      },
      completedExercises: [
        { exerciseId: "exercise-1", loadKg: 50, resultValue: 10 },
      ],
      session: { id: "session-1" },
    });

    expect(saveWithSession).not.toHaveBeenCalled();
  });
});
