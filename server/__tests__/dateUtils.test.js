const {
  startOfIsoWeek,
  endOfIsoWeek,
  getIsoWeekDay,
} = require("../utils/dateUtils");

describe("ISO Week Utilities", () => {
  describe("startOfIsoWeek", () => {
    it("returns Monday 00:00 UTC for a Wednesday", () => {
      const wed = new Date("2026-03-25T14:30:00Z");
      const result = startOfIsoWeek(wed);
      expect(result.toISOString()).toBe("2026-03-23T00:00:00.000Z");
    });

    it("returns same Monday for a Monday", () => {
      const mon = new Date("2026-03-23T10:00:00Z");
      const result = startOfIsoWeek(mon);
      expect(result.toISOString()).toBe("2026-03-23T00:00:00.000Z");
    });

    it("returns previous Monday for a Sunday", () => {
      const sun = new Date("2026-03-29T23:59:59Z");
      const result = startOfIsoWeek(sun);
      expect(result.toISOString()).toBe("2026-03-23T00:00:00.000Z");
    });
  });

  describe("endOfIsoWeek", () => {
    it("returns Sunday 23:59:59.999 UTC for week start", () => {
      const weekStart = new Date("2026-03-23T00:00:00Z");
      const result = endOfIsoWeek(weekStart);
      expect(result.toISOString()).toBe("2026-03-29T23:59:59.999Z");
    });
  });

  describe("getIsoWeekDay", () => {
    it("returns 1 for Monday", () => {
      expect(getIsoWeekDay(new Date("2026-03-23T00:00:00Z"))).toBe(1);
    });

    it("returns 7 for Sunday", () => {
      expect(getIsoWeekDay(new Date("2026-03-29T00:00:00Z"))).toBe(7);
    });

    it("returns 3 for Wednesday", () => {
      expect(getIsoWeekDay(new Date("2026-03-25T00:00:00Z"))).toBe(3);
    });
  });
});
