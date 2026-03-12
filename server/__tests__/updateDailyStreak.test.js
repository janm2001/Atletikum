jest.mock("../models/User", () => ({
  User: {
    findOneAndUpdate: jest.fn(),
  },
}));

const { User } = require("../models/User");
const { updateDailyStreak } = require("../utils/updateDailyStreak");

describe("updateDailyStreak", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates the streak through a single atomic findOneAndUpdate call", async () => {
    const updatedUser = {
      _id: "user-1",
      dailyStreak: 3,
      lastActivityDate: new Date("2026-03-12T10:00:00.000Z"),
    };

    User.findOneAndUpdate.mockResolvedValue(updatedUser);

    const result = await updateDailyStreak("user-1", {
      now: new Date("2026-03-12T10:00:00.000Z"),
    });

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "user-1" },
      expect.any(Array),
      { new: true },
    );
    expect(result).toBe(updatedUser);
  });

  it("builds a UTC day-boundary pipeline for streak calculation", async () => {
    User.findOneAndUpdate.mockResolvedValue(null);
    const now = new Date("2026-03-12T10:00:00.000Z");

    await updateDailyStreak("user-1", { now });

    const [, pipeline] = User.findOneAndUpdate.mock.calls[0];
    const firstStage = pipeline[0];

    expect(firstStage.$set.dailyStreak.$switch).toBeDefined();
    expect(firstStage.$set.lastActivityDate.$cond).toBeDefined();
    expect(JSON.stringify(firstStage)).toContain("2026-03-12T00:00:00.000Z");
    expect(JSON.stringify(firstStage)).toContain("2026-03-13T00:00:00.000Z");
  });
});
