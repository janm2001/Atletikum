jest.mock("../models/XpLedger", () => ({
  XpLedger: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.mock("../utils/mongoTransaction", () => ({
  createWithSession: jest.fn(async (Model, document) => Model.create(document)),
}));

const { XpLedger } = require("../models/XpLedger");
const { createWithSession } = require("../utils/mongoTransaction");
const {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  recordXpEvent,
  getUserXpHistory,
  getUserXpSummary,
} = require("../services/xpLedgerService");

describe("xpLedgerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("recordXpEvent", () => {
    it("creates a ledger entry with all fields", async () => {
      const entry = {
        user: "user-1",
        source: "quiz",
        amount: 50,
        category: "brain",
        sourceEntityId: "article-1",
        description: "Quiz passed: 2/2",
      };
      XpLedger.create.mockResolvedValue(entry);

      const result = await recordXpEvent({
        userId: "user-1",
        source: "quiz",
        amount: 50,
        category: "brain",
        sourceEntityId: "article-1",
        description: "Quiz passed: 2/2",
        session: { id: "session-1" },
      });

      expect(createWithSession).toHaveBeenCalledWith(
        XpLedger,
        {
          user: "user-1",
          source: "quiz",
          amount: 50,
          category: "brain",
          sourceEntityId: "article-1",
          description: "Quiz passed: 2/2",
        },
        { id: "session-1" },
      );
      expect(result).toEqual(entry);
    });

    it("defaults sourceEntityId to null when not provided", async () => {
      XpLedger.create.mockResolvedValue({});

      await recordXpEvent({
        userId: "user-1",
        source: "workout",
        amount: 100,
        category: "body",
      });

      expect(createWithSession).toHaveBeenCalledWith(
        XpLedger,
        expect.objectContaining({
          sourceEntityId: null,
          description: "",
        }),
        null,
      );
    });
  });

  describe("getUserXpHistory", () => {
    it("returns paginated ledger entries", async () => {
      const mockEntries = [
        { user: "user-1", source: "quiz", amount: 50 },
        { user: "user-1", source: "workout", amount: 100 },
      ];
      const leanMock = jest.fn().mockResolvedValue(mockEntries);
      const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      XpLedger.find.mockReturnValue({ sort: sortMock });
      XpLedger.countDocuments.mockResolvedValue(10);

      const result = await getUserXpHistory({
        userId: "user-1",
        limit: 20,
        offset: 5,
      });

      expect(XpLedger.find).toHaveBeenCalledWith({ user: "user-1" });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(skipMock).toHaveBeenCalledWith(5);
      expect(limitMock).toHaveBeenCalledWith(20);
      expect(result).toEqual({ entries: mockEntries, total: 10 });
    });

    it("clamps limit to MAX_LIMIT", async () => {
      const leanMock = jest.fn().mockResolvedValue([]);
      const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      XpLedger.find.mockReturnValue({ sort: sortMock });
      XpLedger.countDocuments.mockResolvedValue(0);

      await getUserXpHistory({ userId: "user-1", limit: 999 });

      expect(limitMock).toHaveBeenCalledWith(MAX_LIMIT);
    });

    it("uses DEFAULT_LIMIT when limit is not specified", async () => {
      const leanMock = jest.fn().mockResolvedValue([]);
      const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      XpLedger.find.mockReturnValue({ sort: sortMock });
      XpLedger.countDocuments.mockResolvedValue(0);

      await getUserXpHistory({ userId: "user-1" });

      expect(limitMock).toHaveBeenCalledWith(DEFAULT_LIMIT);
      expect(skipMock).toHaveBeenCalledWith(0);
    });
  });

  describe("getUserXpSummary", () => {
    it("aggregates XP by source and category", async () => {
      XpLedger.aggregate.mockResolvedValue([
        { _id: { source: "quiz", category: "brain" }, totalAmount: 200, count: 4 },
        { _id: { source: "workout", category: "body" }, totalAmount: 500, count: 5 },
        { _id: { source: "achievement", category: "brain" }, totalAmount: 50, count: 1 },
      ]);

      const result = await getUserXpSummary({ userId: "user-1" });

      expect(result.grandTotal).toBe(750);
      expect(result.bySource.quiz).toEqual({ total: 200, count: 4 });
      expect(result.bySource.workout).toEqual({ total: 500, count: 5 });
      expect(result.bySource.achievement).toEqual({ total: 50, count: 1 });
      expect(result.byCategory.brain).toEqual({ total: 250, count: 5 });
      expect(result.byCategory.body).toEqual({ total: 500, count: 5 });
    });

    it("returns empty summary when no entries exist", async () => {
      XpLedger.aggregate.mockResolvedValue([]);

      const result = await getUserXpSummary({ userId: "user-1" });

      expect(result.grandTotal).toBe(0);
      expect(result.bySource).toEqual({});
      expect(result.byCategory).toEqual({});
    });
  });
});
