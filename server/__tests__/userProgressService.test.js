jest.mock("../models/User", () => ({
  User: {
    findById: jest.fn(),
  },
}));

jest.mock("../utils/leveling", () => ({
  getLevelFromTotalXp: jest.fn(),
}));

jest.mock("../utils/sanitizeUser", () => ({
  sanitizeUser: jest.fn(),
}));

jest.mock("../utils/achievementChecker", () => ({
  checkAndUnlockAchievements: jest.fn(),
}));

jest.mock("../utils/updateDailyStreak", () => ({
  updateDailyStreak: jest.fn(),
}));

jest.mock("../utils/mongoTransaction", () => ({
  attachSession: jest.fn((operation) => operation),
  saveWithSession: jest.fn().mockResolvedValue(undefined),
}));

const { User } = require("../models/User");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { checkAndUnlockAchievements } = require("../utils/achievementChecker");
const { updateDailyStreak } = require("../utils/updateDailyStreak");
const { saveWithSession } = require("../utils/mongoTransaction");
const { applyUserProgress } = require("../services/userProgressService");

const createUser = (overrides = {}) => ({
  _id: "user-1",
  username: "Ada",
  email: "ada@example.com",
  trainingFrequency: 3,
  focus: "snaga",
  level: 1,
  totalXp: 25,
  brainXp: 10,
  bodyXp: 15,
  dailyStreak: 2,
  role: "user",
  profilePicture: "",
  achievements: [],
  ...overrides,
});

describe("userProgressService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("applies XP, preserves session-aware orchestration, and sanitizes the updated user", async () => {
    const user = createUser();
    const streakUpdatedUser = createUser({
      level: 3,
      totalXp: 40,
      brainXp: 15,
      bodyXp: 25,
      dailyStreak: 3,
    });

    User.findById.mockReturnValue(user);
    getLevelFromTotalXp.mockReturnValue(3);
    updateDailyStreak.mockResolvedValue(streakUpdatedUser);
    checkAndUnlockAchievements.mockResolvedValue([{ key: "streak-3" }]);
    sanitizeUser.mockImplementation((currentUser) => ({
      _id: currentUser._id,
      totalXp: currentUser.totalXp,
      dailyStreak: currentUser.dailyStreak,
    }));

    const result = await applyUserProgress({
      userId: "user-1",
      brainXp: 5,
      bodyXp: 10,
      shouldUpdateStreak: true,
      shouldUnlockAchievements: true,
      session: { id: "session-1" },
    });

    expect(User.findById).toHaveBeenCalledWith("user-1");
    expect(getLevelFromTotalXp).toHaveBeenCalledWith(40);
    expect(saveWithSession).toHaveBeenCalledWith(user, {
      id: "session-1",
    });
    expect(updateDailyStreak).toHaveBeenCalledWith("user-1", {
      session: { id: "session-1" },
    });
    expect(checkAndUnlockAchievements).toHaveBeenCalledWith("user-1", {
      session: { id: "session-1" },
      user: streakUpdatedUser,
    });
    expect(sanitizeUser).toHaveBeenCalledWith(streakUpdatedUser);
    expect(result).toEqual({
      user: {
        _id: "user-1",
        totalXp: 40,
        dailyStreak: 3,
      },
      newAchievements: [{ key: "streak-3" }],
    });
  });

  it("avoids unnecessary work when no XP, streak, or achievement updates are requested", async () => {
    const user = createUser();
    User.findById.mockReturnValue(user);
    sanitizeUser.mockReturnValue({ _id: "user-1" });

    const result = await applyUserProgress({ userId: "user-1" });

    expect(saveWithSession).not.toHaveBeenCalled();
    expect(updateDailyStreak).not.toHaveBeenCalled();
    expect(checkAndUnlockAchievements).not.toHaveBeenCalled();
    expect(sanitizeUser).toHaveBeenCalledWith(user);
    expect(result).toEqual({
      user: { _id: "user-1" },
      newAchievements: [],
    });
  });

  it("falls back to the loaded user when streak update returns null", async () => {
    const user = createUser();
    User.findById.mockReturnValue(user);
    getLevelFromTotalXp.mockReturnValue(2);
    updateDailyStreak.mockResolvedValue(null);
    sanitizeUser.mockImplementation((currentUser) => ({
      _id: currentUser._id,
      totalXp: currentUser.totalXp,
      level: currentUser.level,
      dailyStreak: currentUser.dailyStreak,
    }));

    const result = await applyUserProgress({
      userId: "user-1",
      brainXp: 5,
      shouldUpdateStreak: true,
      session: { id: "session-1" },
    });

    expect(saveWithSession).toHaveBeenCalledWith(user, {
      id: "session-1",
    });
    expect(updateDailyStreak).toHaveBeenCalledWith("user-1", {
      session: { id: "session-1" },
    });
    expect(sanitizeUser).toHaveBeenCalledWith(user);
    expect(result).toEqual({
      user: {
        _id: "user-1",
        totalXp: 30,
        level: 2,
        dailyStreak: 2,
      },
      newAchievements: [],
    });
  });
});
