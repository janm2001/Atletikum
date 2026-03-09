const {
  XP_BASE_PER_LEVEL,
  XP_GROWTH_PER_LEVEL,
  getXpRequiredForLevelUp,
  getTotalXpForLevelStart,
  getLevelFromTotalXp,
} = require("../utils/leveling");

describe("leveling utilities", () => {
  describe("getXpRequiredForLevelUp", () => {
    it("returns base XP for level 1", () => {
      expect(getXpRequiredForLevelUp(1)).toBe(XP_BASE_PER_LEVEL);
    });

    it("grows linearly per level", () => {
      expect(getXpRequiredForLevelUp(2)).toBe(
        XP_BASE_PER_LEVEL + XP_GROWTH_PER_LEVEL,
      );
      expect(getXpRequiredForLevelUp(3)).toBe(
        XP_BASE_PER_LEVEL + 2 * XP_GROWTH_PER_LEVEL,
      );
    });

    it("handles zero and negative levels safely", () => {
      expect(getXpRequiredForLevelUp(0)).toBe(XP_BASE_PER_LEVEL);
      expect(getXpRequiredForLevelUp(-5)).toBe(XP_BASE_PER_LEVEL);
    });

    it("handles non-numeric input", () => {
      expect(getXpRequiredForLevelUp(null)).toBe(XP_BASE_PER_LEVEL);
      expect(getXpRequiredForLevelUp(undefined)).toBe(XP_BASE_PER_LEVEL);
      expect(getXpRequiredForLevelUp("abc")).toBe(XP_BASE_PER_LEVEL);
    });
  });

  describe("getTotalXpForLevelStart", () => {
    it("returns 0 for level 1", () => {
      expect(getTotalXpForLevelStart(1)).toBe(0);
    });

    it("returns base XP for level 2", () => {
      expect(getTotalXpForLevelStart(2)).toBe(XP_BASE_PER_LEVEL);
    });

    it("accumulates correctly for level 3", () => {
      const expected = getXpRequiredForLevelUp(1) + getXpRequiredForLevelUp(2);
      expect(getTotalXpForLevelStart(3)).toBe(expected);
    });

    it("handles zero and negative levels", () => {
      expect(getTotalXpForLevelStart(0)).toBe(0);
      expect(getTotalXpForLevelStart(-1)).toBe(0);
    });
  });

  describe("getLevelFromTotalXp", () => {
    it("returns level 1 for 0 XP", () => {
      expect(getLevelFromTotalXp(0)).toBe(1);
    });

    it("returns level 1 for XP just under level-up threshold", () => {
      expect(getLevelFromTotalXp(XP_BASE_PER_LEVEL - 1)).toBe(1);
    });

    it("returns level 2 at exactly base XP", () => {
      expect(getLevelFromTotalXp(XP_BASE_PER_LEVEL)).toBe(2);
    });

    it("handles negative XP", () => {
      expect(getLevelFromTotalXp(-100)).toBe(1);
    });

    it("handles non-numeric input", () => {
      expect(getLevelFromTotalXp(null)).toBe(1);
      expect(getLevelFromTotalXp("abc")).toBe(1);
    });
  });

  describe("round-trip consistency", () => {
    it("getTotalXpForLevelStart → getLevelFromTotalXp returns the same level", () => {
      for (let level = 1; level <= 50; level++) {
        const xp = getTotalXpForLevelStart(level);
        expect(getLevelFromTotalXp(xp)).toBe(level);
      }
    });

    it("total XP for consecutive levels increases monotonically", () => {
      for (let level = 2; level <= 50; level++) {
        expect(getTotalXpForLevelStart(level)).toBeGreaterThan(
          getTotalXpForLevelStart(level - 1),
        );
      }
    });
  });
});
