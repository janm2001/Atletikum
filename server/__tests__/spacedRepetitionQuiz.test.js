const {
  getCooldownDays,
  getNextCooldownLevel,
  getXpMultiplier,
} = require("../utils/quizTiming");

describe("Spaced Repetition Quiz Timing", () => {
  describe("getCooldownDays", () => {
    it("returns 3 days for level 1", () => {
      expect(getCooldownDays(1)).toBe(3);
    });
    it("returns 7 days for level 2", () => {
      expect(getCooldownDays(2)).toBe(7);
    });
    it("returns 14 days for level 3", () => {
      expect(getCooldownDays(3)).toBe(14);
    });
    it("returns 30 days for level 4", () => {
      expect(getCooldownDays(4)).toBe(30);
    });
    it("returns 3 days for invalid level", () => {
      expect(getCooldownDays(0)).toBe(3);
      expect(getCooldownDays(5)).toBe(3);
    });
  });

  describe("getNextCooldownLevel", () => {
    it("increases level on pass", () => {
      expect(getNextCooldownLevel(1, true)).toBe(2);
      expect(getNextCooldownLevel(2, true)).toBe(3);
      expect(getNextCooldownLevel(3, true)).toBe(4);
    });
    it("caps at level 4", () => {
      expect(getNextCooldownLevel(4, true)).toBe(4);
    });
    it("decreases level on fail (if level > 1)", () => {
      expect(getNextCooldownLevel(3, false)).toBe(2);
      expect(getNextCooldownLevel(2, false)).toBe(1);
    });
    it("stays at level 1 on fail", () => {
      expect(getNextCooldownLevel(1, false)).toBe(1);
    });
  });

  describe("getXpMultiplier", () => {
    it("returns 1.0 for first attempt", () => {
      expect(getXpMultiplier(1)).toBe(1.0);
    });
    it("returns 0.5 for attempts 2-3", () => {
      expect(getXpMultiplier(2)).toBe(0.5);
      expect(getXpMultiplier(3)).toBe(0.5);
    });
    it("returns 0.25 for attempts 4+", () => {
      expect(getXpMultiplier(4)).toBe(0.25);
      expect(getXpMultiplier(10)).toBe(0.25);
    });
  });
});
