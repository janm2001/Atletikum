jest.mock("../models/User", () => ({
  User: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.mock("../models/QuizCompletion", () => ({
  QuizCompletion: {
    countDocuments: jest.fn(),
  },
}));

const { User } = require("../models/User");
const { QuizCompletion } = require("../models/QuizCompletion");
const {
  STREAK_BUCKETS,
  ACHIEVEMENT_THRESHOLDS,
  getGamificationKpis,
} = require("../services/analyticsService");

describe("analyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getGamificationKpis", () => {
    it("returns streak survival distribution", async () => {
      User.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { dailyStreak: 0 },
          { dailyStreak: 2 },
          { dailyStreak: 5 },
          { dailyStreak: 10 },
          { dailyStreak: 20 },
          { dailyStreak: 1 },
        ]),
      });
      QuizCompletion.countDocuments.mockResolvedValue(0);
      User.countDocuments.mockResolvedValue(6);
      User.aggregate.mockResolvedValue([]);

      const result = await getGamificationKpis();

      expect(result.streakSurvival["0"]).toBe(1);
      expect(result.streakSurvival["1-3"]).toBe(2);
      expect(result.streakSurvival["4-7"]).toBe(1);
      expect(result.streakSurvival["8-14"]).toBe(1);
      expect(result.streakSurvival["15+"]).toBe(1);
    });

    it("returns quiz pass rate", async () => {
      User.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });
      QuizCompletion.countDocuments
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(65);
      User.countDocuments.mockResolvedValue(0);
      User.aggregate.mockResolvedValue([]);

      const result = await getGamificationKpis();

      expect(result.quizPassRate.total).toBe(100);
      expect(result.quizPassRate.passed).toBe(65);
      expect(result.quizPassRate.rate).toBeCloseTo(0.65);
    });

    it("returns zero rate when no quizzes exist", async () => {
      User.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });
      QuizCompletion.countDocuments.mockResolvedValue(0);
      User.countDocuments.mockResolvedValue(0);
      User.aggregate.mockResolvedValue([]);

      const result = await getGamificationKpis();

      expect(result.quizPassRate.rate).toBe(0);
    });

    it("returns achievement unlock rates for each threshold", async () => {
      User.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });
      QuizCompletion.countDocuments.mockResolvedValue(0);
      User.countDocuments
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(40)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(3);
      User.aggregate.mockResolvedValue([]);

      const result = await getGamificationKpis();

      expect(result.achievementUnlockRates["1+"]).toEqual({
        count: 80,
        totalUsers: 100,
        rate: 0.8,
      });
      expect(result.achievementUnlockRates["5+"]).toEqual({
        count: 40,
        totalUsers: 100,
        rate: 0.4,
      });
    });

    it("returns weekly active users by level", async () => {
      User.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });
      QuizCompletion.countDocuments.mockResolvedValue(0);
      User.countDocuments.mockResolvedValue(0);
      User.aggregate.mockResolvedValue([
        { _id: 1, count: 15 },
        { _id: 2, count: 8 },
        { _id: 3, count: 3 },
      ]);

      const result = await getGamificationKpis();

      expect(result.weeklyActiveByLevel).toEqual({
        1: 15,
        2: 8,
        3: 3,
      });
    });
  });

  it("exports expected constants", () => {
    expect(STREAK_BUCKETS).toBeDefined();
    expect(Array.isArray(STREAK_BUCKETS)).toBe(true);
    expect(ACHIEVEMENT_THRESHOLDS).toBeDefined();
    expect(Array.isArray(ACHIEVEMENT_THRESHOLDS)).toBe(true);
  });
});
