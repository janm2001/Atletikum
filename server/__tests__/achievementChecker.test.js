jest.mock("../models/Achievement", () => ({
  Achievement: {
    find: jest.fn(),
  },
}));

jest.mock("../models/User", () => ({
  User: {
    findById: jest.fn(),
  },
}));

jest.mock("../models/WorkoutLog", () => ({
  WorkoutLog: {
    countDocuments: jest.fn(),
    exists: jest.fn(),
  },
}));

jest.mock("../models/QuizCompletion", () => ({
  QuizCompletion: {
    countDocuments: jest.fn(),
    find: jest.fn(),
    exists: jest.fn(),
  },
}));

jest.mock("../utils/leveling", () => ({
  getLevelFromTotalXp: jest.fn((totalXp) => (totalXp >= 100 ? 2 : 1)),
}));

jest.mock("../utils/mongoTransaction", () => ({
  attachSession: jest.fn((operation) => operation),
  saveWithSession: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../services/xpLedgerService", () => ({
  recordXpEvent: jest.fn().mockResolvedValue(undefined),
}));

const { Achievement } = require("../models/Achievement");
const { WorkoutLog } = require("../models/WorkoutLog");
const { QuizCompletion } = require("../models/QuizCompletion");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { saveWithSession } = require("../utils/mongoTransaction");
const {
  MAX_ACHIEVEMENT_XP_PER_BATCH,
  checkAndUnlockAchievements,
} = require("../utils/achievementChecker");

const createAchievement = ({
  id,
  trigger,
  threshold,
  xpReward = 10,
  xpCategory = "both",
  key = id,
  title = id,
  description = `${id} description`,
  category = "milestone",
  badgeIcon = "trophy",
}) => ({
  _id: { toString: () => id },
  key,
  title,
  description,
  trigger,
  threshold,
  xpReward,
  xpCategory,
  category,
  badgeIcon,
});

const createUser = (overrides = {}) => ({
  _id: "user-1",
  brainXp: 40,
  bodyXp: 50,
  totalXp: 90,
  level: 1,
  dailyStreak: 0,
  achievements: [],
  ...overrides,
});

const createPerfectQuizQuery = (value) => ({
  sort: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(value),
    }),
  }),
});

describe("achievementChecker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("skips database progress checks when every achievement is already unlocked", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        createAchievement({
          id: "first-workout",
          trigger: "workout_count",
          threshold: 1,
        }),
      ]),
    });

    const result = await checkAndUnlockAchievements("user-1", {
      user: createUser({
        achievements: [
          {
            achievement: { toString: () => "first-workout" },
            unlockedAt: new Date("2026-03-10T10:00:00.000Z"),
          },
        ],
      }),
    });

    expect(result).toEqual([]);
    expect(WorkoutLog.countDocuments).not.toHaveBeenCalled();
    expect(QuizCompletion.countDocuments).not.toHaveBeenCalled();
    expect(QuizCompletion.find).not.toHaveBeenCalled();
    expect(WorkoutLog.exists).not.toHaveBeenCalled();
    expect(QuizCompletion.exists).not.toHaveBeenCalled();
    expect(saveWithSession).not.toHaveBeenCalled();
  });

  it("keeps sequential unlock behavior while only querying required activity metrics", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        createAchievement({
          id: "first-workout",
          trigger: "workout_count",
          threshold: 1,
          xpReward: 30,
          xpCategory: "both",
        }),
        createAchievement({
          id: "level-two",
          trigger: "level",
          threshold: 2,
          xpReward: 10,
          xpCategory: "brain",
          category: "performance",
        }),
      ]),
    });
    WorkoutLog.countDocuments.mockResolvedValue(1);

    const user = createUser();
    const session = { id: "session-1" };

    const result = await checkAndUnlockAchievements("user-1", {
      user,
      session,
    });

    expect(result.map((achievement) => achievement.key)).toEqual([
      "first-workout",
      "level-two",
    ]);
    expect(WorkoutLog.countDocuments).toHaveBeenCalledWith({ user: "user-1" });
    expect(QuizCompletion.countDocuments).not.toHaveBeenCalled();
    expect(QuizCompletion.find).not.toHaveBeenCalled();
    expect(WorkoutLog.exists).not.toHaveBeenCalled();
    expect(QuizCompletion.exists).not.toHaveBeenCalled();
    expect(getLevelFromTotalXp).toHaveBeenNthCalledWith(1, 120);
    expect(getLevelFromTotalXp).toHaveBeenNthCalledWith(2, 130);
    expect(user.brainXp).toBe(65);
    expect(user.bodyXp).toBe(65);
    expect(user.totalXp).toBe(130);
    expect(user.level).toBe(2);
    expect(user.achievements).toHaveLength(2);
    expect(saveWithSession).toHaveBeenCalledWith(user, session);
  });

  it("checks perfect-quiz and same-day activity triggers without unrelated count queries", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        createAchievement({
          id: "perfect-quiz",
          trigger: "perfect_quiz",
          threshold: 1,
          xpReward: 20,
          xpCategory: "brain",
        }),
        createAchievement({
          id: "same-day-both",
          trigger: "same_day_both",
          threshold: 1,
          xpReward: 15,
          xpCategory: "body",
          category: "special",
        }),
      ]),
    });
    QuizCompletion.find.mockReturnValue(
      createPerfectQuizQuery([{ score: 5, totalQuestions: 5 }]),
    );
    WorkoutLog.exists.mockResolvedValue({ _id: "workout-log-1" });
    QuizCompletion.exists.mockResolvedValue({ _id: "quiz-1" });

    const result = await checkAndUnlockAchievements("user-1", {
      user: createUser({
        brainXp: 0,
        bodyXp: 0,
        totalXp: 0,
      }),
    });

    expect(result.map((achievement) => achievement.key)).toEqual([
      "perfect-quiz",
      "same-day-both",
    ]);
    expect(WorkoutLog.countDocuments).not.toHaveBeenCalled();
    expect(QuizCompletion.countDocuments).not.toHaveBeenCalled();
    expect(QuizCompletion.find).toHaveBeenCalledWith({ user: "user-1" });
    expect(WorkoutLog.exists).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user-1",
        date: expect.objectContaining({
          $gte: expect.any(Date),
          $lt: expect.any(Date),
        }),
      }),
    );
    expect(QuizCompletion.exists).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user-1",
        completedAt: expect.objectContaining({
          $gte: expect.any(Date),
          $lt: expect.any(Date),
        }),
      }),
    );
    expect(saveWithSession).toHaveBeenCalledTimes(1);
  });

  it("caps total achievement XP per batch at MAX_ACHIEVEMENT_XP_PER_BATCH", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        createAchievement({
          id: "big-reward-1",
          trigger: "workout_count",
          threshold: 1,
          xpReward: 400,
          xpCategory: "body",
        }),
        createAchievement({
          id: "big-reward-2",
          trigger: "quiz_count",
          threshold: 1,
          xpReward: 300,
          xpCategory: "brain",
        }),
      ]),
    });
    WorkoutLog.countDocuments.mockResolvedValue(5);
    QuizCompletion.countDocuments.mockResolvedValue(5);

    const user = createUser({ brainXp: 0, bodyXp: 0, totalXp: 0 });

    const result = await checkAndUnlockAchievements("user-1", { user });

    expect(result).toHaveLength(2);
    expect(result.map((a) => a.key)).toEqual(["big-reward-1", "big-reward-2"]);

    const totalXpAwarded = user.brainXp + user.bodyXp;
    expect(totalXpAwarded).toBeLessThanOrEqual(MAX_ACHIEVEMENT_XP_PER_BATCH);
    expect(user.bodyXp).toBe(400);
    expect(user.brainXp).toBe(100);
    expect(user.totalXp).toBe(500);
  });
});
