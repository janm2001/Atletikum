jest.mock("../models/User", () => ({
  User: {
    findById: jest.fn(),
  },
}));

jest.mock("../models/XpLedger", () => ({
  XpLedger: {
    aggregate: jest.fn(),
  },
}));

const { User } = require("../models/User");
const { XpLedger } = require("../models/XpLedger");
const {
  XP_ANOMALY_THRESHOLD,
  checkXpConsistency,
  checkDuplicateAchievements,
  detectXpAnomalies,
} = require("../utils/xpIntegrity");

describe("xpIntegrity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkXpConsistency", () => {
    it("returns consistent when all XP values match", async () => {
      User.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: "user-1",
          totalXp: 300,
          brainXp: 100,
          bodyXp: 200,
        }),
      });

      XpLedger.aggregate.mockResolvedValue([
        { _id: "brain", total: 100 },
        { _id: "body", total: 200 },
      ]);

      const result = await checkXpConsistency("user-1");

      expect(result.isConsistent).toBe(true);
      expect(result.userTotalXp).toBe(300);
      expect(result.computedTotalXp).toBe(300);
      expect(result.ledgerTotalXp).toBe(300);
      expect(result.discrepancies).toEqual([]);
    });

    it("detects totalXp != brainXp + bodyXp discrepancy", async () => {
      User.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: "user-1",
          totalXp: 350,
          brainXp: 100,
          bodyXp: 200,
        }),
      });

      XpLedger.aggregate.mockResolvedValue([
        { _id: "brain", total: 100 },
        { _id: "body", total: 200 },
      ]);

      const result = await checkXpConsistency("user-1");

      expect(result.isConsistent).toBe(false);
      expect(result.discrepancies).toHaveLength(2);
      expect(result.discrepancies[0]).toContain("ne odgovara brainXp + bodyXp");
    });

    it("detects totalXp != ledger sum discrepancy", async () => {
      User.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: "user-1",
          totalXp: 300,
          brainXp: 100,
          bodyXp: 200,
        }),
      });

      XpLedger.aggregate.mockResolvedValue([
        { _id: "brain", total: 50 },
        { _id: "body", total: 200 },
      ]);

      const result = await checkXpConsistency("user-1");

      expect(result.isConsistent).toBe(false);
      expect(result.discrepancies).toContainEqual(
        expect.stringContaining("ne odgovara zbroju ledgera"),
      );
    });

    it("returns not consistent when user is not found", async () => {
      User.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await checkXpConsistency("nonexistent");

      expect(result.isConsistent).toBe(false);
      expect(result.discrepancies).toContainEqual(
        expect.stringContaining("Korisnik nije pronađen"),
      );
    });
  });

  describe("checkDuplicateAchievements", () => {
    it("returns empty array when no duplicates exist", async () => {
      User.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: "user-1",
          achievements: [
            { achievement: { toString: () => "ach-1" } },
            { achievement: { toString: () => "ach-2" } },
          ],
        }),
      });

      const result = await checkDuplicateAchievements("user-1");

      expect(result).toEqual([]);
    });

    it("returns duplicate achievement IDs", async () => {
      User.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: "user-1",
          achievements: [
            { achievement: { toString: () => "ach-1" } },
            { achievement: { toString: () => "ach-2" } },
            { achievement: { toString: () => "ach-1" } },
          ],
        }),
      });

      const result = await checkDuplicateAchievements("user-1");

      expect(result).toEqual(["ach-1"]);
    });

    it("returns empty array when user is not found", async () => {
      User.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await checkDuplicateAchievements("nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("detectXpAnomalies", () => {
    it("returns no anomaly when XP is within threshold", async () => {
      XpLedger.aggregate.mockResolvedValue([
        { _id: null, xpInWindow: 500 },
      ]);

      const result = await detectXpAnomalies("user-1");

      expect(result.isAnomaly).toBe(false);
      expect(result.xpInWindow).toBe(500);
      expect(result.threshold).toBe(XP_ANOMALY_THRESHOLD);
    });

    it("returns anomaly when XP exceeds threshold", async () => {
      XpLedger.aggregate.mockResolvedValue([
        { _id: null, xpInWindow: XP_ANOMALY_THRESHOLD + 1 },
      ]);

      const result = await detectXpAnomalies("user-1");

      expect(result.isAnomaly).toBe(true);
      expect(result.xpInWindow).toBe(XP_ANOMALY_THRESHOLD + 1);
    });

    it("returns zero XP when no entries exist in window", async () => {
      XpLedger.aggregate.mockResolvedValue([]);

      const result = await detectXpAnomalies("user-1");

      expect(result.isAnomaly).toBe(false);
      expect(result.xpInWindow).toBe(0);
    });

    it("respects custom window hours", async () => {
      XpLedger.aggregate.mockResolvedValue([
        { _id: null, xpInWindow: 100 },
      ]);

      await detectXpAnomalies("user-1", { windowHours: 48 });

      expect(XpLedger.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              user: "user-1",
              createdAt: expect.objectContaining({
                $gte: expect.any(Date),
              }),
            }),
          }),
        ]),
      );
    });
  });
});
