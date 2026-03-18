const { getGamificationStatus } = require("../services/gamificationService");
const {
  getXpRequiredForLevelUp,
  getTotalXpForLevelStart,
} = require("../utils/leveling");

const buildUser = (overrides = {}) => ({
  level: 3,
  totalXp: 550,
  dailyStreak: 5,
  longestStreak: 10,
  lastActivityDate: null,
  ...overrides,
});

describe("gamificationService", () => {
  describe("getGamificationStatus", () => {
    it("returns correct XP progress for a user", () => {
      const user = buildUser({ level: 3, totalXp: 550 });
      const result = getGamificationStatus(user);

      const xpForNext = getXpRequiredForLevelUp(3);
      const levelStart = getTotalXpForLevelStart(3);
      const xpInLevel = 550 - levelStart;

      expect(result.level).toBe(3);
      expect(result.totalXp).toBe(550);
      expect(result.xpToNextLevel).toBe(xpForNext - xpInLevel);
      expect(result.xpForNextLevel).toBe(xpForNext);
      expect(result.currentLevelProgress).toBe(
        Math.min(100, Math.round((xpInLevel / xpForNext) * 100)),
      );
    });

    it("returns streakAtRisk=false when user has activity today", () => {
      const now = new Date("2026-03-18T14:00:00Z");
      const user = buildUser({
        dailyStreak: 5,
        lastActivityDate: new Date("2026-03-18T08:00:00Z"),
      });

      const result = getGamificationStatus(user, { now });

      expect(result.streakAtRisk).toBe(false);
      expect(result.hasActivityToday).toBe(true);
    });

    it("returns streakAtRisk=true when user has no activity today but has a streak", () => {
      const now = new Date("2026-03-18T14:00:00Z");
      const user = buildUser({
        dailyStreak: 5,
        lastActivityDate: new Date("2026-03-17T20:00:00Z"),
      });

      const result = getGamificationStatus(user, { now });

      expect(result.streakAtRisk).toBe(true);
      expect(result.hasActivityToday).toBe(false);
    });

    it("returns streakAtRisk=false when dailyStreak is 0", () => {
      const now = new Date("2026-03-18T14:00:00Z");
      const user = buildUser({
        dailyStreak: 0,
        lastActivityDate: new Date("2026-03-15T10:00:00Z"),
      });

      const result = getGamificationStatus(user, { now });

      expect(result.streakAtRisk).toBe(false);
    });

    it("returns null streakExpiresAt when lastActivityDate is null", () => {
      const user = buildUser({ lastActivityDate: null });

      const result = getGamificationStatus(user);

      expect(result.streakExpiresAt).toBeNull();
      expect(result.streakAtRisk).toBe(false);
    });

    it("calculates streakExpiresAt as end of day after last activity", () => {
      const now = new Date("2026-03-18T14:00:00Z");
      const user = buildUser({
        dailyStreak: 3,
        lastActivityDate: new Date("2026-03-17T15:00:00Z"),
      });

      const result = getGamificationStatus(user, { now });

      expect(result.streakExpiresAt).toBe("2026-03-19T00:00:00.000Z");
    });

    it("returns fastestXpAction as quiz or workout", () => {
      const user = buildUser();
      const result = getGamificationStatus(user);

      expect(["quiz", "workout"]).toContain(result.fastestXpAction);
    });

    it("handles missing user fields gracefully", () => {
      const user = {};
      const result = getGamificationStatus(user);

      expect(result.dailyStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.level).toBe(1);
      expect(result.totalXp).toBe(0);
      expect(result.streakExpiresAt).toBeNull();
      expect(result.streakAtRisk).toBe(false);
    });

    it("returns correct dailyStreak and longestStreak", () => {
      const user = buildUser({ dailyStreak: 7, longestStreak: 14 });
      const result = getGamificationStatus(user);

      expect(result.dailyStreak).toBe(7);
      expect(result.longestStreak).toBe(14);
    });

    it("caps currentLevelProgress at 100", () => {
      const levelStart = getTotalXpForLevelStart(2);
      const xpForNext = getXpRequiredForLevelUp(2);
      const user = buildUser({
        level: 2,
        totalXp: levelStart + xpForNext + 100,
      });

      const result = getGamificationStatus(user);

      expect(result.currentLevelProgress).toBeLessThanOrEqual(100);
    });
  });
});
