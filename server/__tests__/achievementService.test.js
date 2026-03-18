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
  },
}));

jest.mock("../models/QuizCompletion", () => ({
  QuizCompletion: {
    countDocuments: jest.fn(),
  },
}));

const { Achievement } = require("../models/Achievement");
const { User } = require("../models/User");
const { WorkoutLog } = require("../models/WorkoutLog");
const { QuizCompletion } = require("../models/QuizCompletion");
const achievementService = require("../services/achievementService");

describe("achievementService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks unlocked achievements for the current user", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => "achievement-1" },
          title: "First",
          trigger: "xp_threshold",
          threshold: 100,
        },
        {
          _id: { toString: () => "achievement-2" },
          title: "Second",
          trigger: "level",
          threshold: 5,
        },
      ]),
    });
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        totalXp: 50,
        dailyStreak: 0,
        level: 1,
        achievements: [
          {
            achievement: { toString: () => "achievement-2" },
            unlockedAt: new Date("2026-03-11T10:00:00.000Z"),
          },
        ],
      }),
    });

    const result = await achievementService.getMyAchievements({
      userId: "user-1",
    });

    expect(result).toEqual([
      expect.objectContaining({
        title: "First",
        isUnlocked: false,
        unlockedAt: null,
      }),
      expect.objectContaining({ title: "Second", isUnlocked: true }),
    ]);
  });

  it("returns progress data for locked achievements with countable triggers", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => "a1" },
          title: "10 Workouts",
          trigger: "workout_count",
          threshold: 10,
        },
        {
          _id: { toString: () => "a2" },
          title: "5 Quizzes",
          trigger: "quiz_count",
          threshold: 5,
        },
      ]),
    });
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        totalXp: 200,
        dailyStreak: 3,
        level: 2,
        achievements: [],
      }),
    });
    WorkoutLog.countDocuments.mockResolvedValue(7);
    QuizCompletion.countDocuments.mockResolvedValue(3);

    const result = await achievementService.getMyAchievements({
      userId: "user-1",
    });

    expect(result[0].progress).toEqual({
      current: 7,
      required: 10,
      progressPercent: 70,
    });
    expect(result[1].progress).toEqual({
      current: 3,
      required: 5,
      progressPercent: 60,
    });
  });

  it("returns progress data for xp_threshold, streak, and level triggers", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => "a1" },
          title: "1000 XP",
          trigger: "xp_threshold",
          threshold: 1000,
        },
        {
          _id: { toString: () => "a2" },
          title: "7 Day Streak",
          trigger: "streak",
          threshold: 7,
        },
        {
          _id: { toString: () => "a3" },
          title: "Level 5",
          trigger: "level",
          threshold: 5,
        },
      ]),
    });
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        totalXp: 500,
        dailyStreak: 3,
        level: 2,
        achievements: [],
      }),
    });

    const result = await achievementService.getMyAchievements({
      userId: "user-1",
    });

    expect(result[0].progress).toEqual({
      current: 500,
      required: 1000,
      progressPercent: 50,
    });
    expect(result[1].progress).toEqual({
      current: 3,
      required: 7,
      progressPercent: 43,
    });
    expect(result[2].progress).toEqual({
      current: 2,
      required: 5,
      progressPercent: 40,
    });
  });

  it("returns null progress for unlocked achievements", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => "a1" },
          title: "First Workout",
          trigger: "workout_count",
          threshold: 1,
        },
      ]),
    });
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        totalXp: 100,
        dailyStreak: 1,
        level: 1,
        achievements: [
          {
            achievement: { toString: () => "a1" },
            unlockedAt: new Date("2026-03-11T10:00:00.000Z"),
          },
        ],
      }),
    });

    const result = await achievementService.getMyAchievements({
      userId: "user-1",
    });

    expect(result[0].isUnlocked).toBe(true);
    expect(result[0].progress).toBeNull();
  });

  it("caps progressPercent at 100", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => "a1" },
          title: "100 XP",
          trigger: "xp_threshold",
          threshold: 100,
        },
      ]),
    });
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        totalXp: 200,
        dailyStreak: 0,
        level: 1,
        achievements: [],
      }),
    });

    const result = await achievementService.getMyAchievements({
      userId: "user-1",
    });

    expect(result[0].progress.progressPercent).toBe(100);
  });

  it("skips workout/quiz count queries when no locked achievements need them", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => "a1" },
          title: "XP Master",
          trigger: "xp_threshold",
          threshold: 500,
        },
      ]),
    });
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        totalXp: 200,
        dailyStreak: 0,
        level: 1,
        achievements: [],
      }),
    });

    await achievementService.getMyAchievements({ userId: "user-1" });

    expect(WorkoutLog.countDocuments).not.toHaveBeenCalled();
    expect(QuizCompletion.countDocuments).not.toHaveBeenCalled();
  });
});
