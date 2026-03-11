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

const { Achievement } = require("../models/Achievement");
const { User } = require("../models/User");
const achievementService = require("../services/achievementService");

describe("achievementService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks unlocked achievements for the current user", async () => {
    Achievement.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: { toString: () => "achievement-1" }, title: "First" },
        { _id: { toString: () => "achievement-2" }, title: "Second" },
      ]),
    });
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
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
});
