jest.mock("../models/WeeklyChallenge", () => {
  const WeeklyChallenge = {
    find: jest.fn(),
    insertMany: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  return { WeeklyChallenge };
});

jest.mock("../models/UserChallengeProgress", () => {
  const UserChallengeProgress = {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  return { UserChallengeProgress };
});

jest.mock("../services/userProgressService", () => ({
  applyUserProgress: jest.fn(),
}));

const { WeeklyChallenge } = require("../models/WeeklyChallenge");
const { UserChallengeProgress } = require("../models/UserChallengeProgress");
const { applyUserProgress } = require("../services/userProgressService");
const {
  startOfIsoWeek,
  endOfIsoWeek,
  getOrCreateWeeklyChallenges,
  getUserChallengeStatus,
  updateChallengeProgress,
} = require("../services/weeklyChallengeService");

const MONDAY = new Date("2026-03-16T10:00:00.000Z");
const WEDNESDAY = new Date("2026-03-18T10:00:00.000Z");
const SUNDAY = new Date("2026-03-22T23:59:59.999Z");

const makeLean = (value) => ({ lean: jest.fn().mockResolvedValue(value) });

const makeChallenges = () => [
  {
    _id: "ch-quiz",
    type: "quiz",
    targetCount: 3,
    xpReward: 100,
    description: "quiz desc",
    weekStart: startOfIsoWeek(WEDNESDAY),
    weekEnd: endOfIsoWeek(startOfIsoWeek(WEDNESDAY)),
  },
  {
    _id: "ch-workout",
    type: "workout",
    targetCount: 2,
    xpReward: 150,
    description: "workout desc",
    weekStart: startOfIsoWeek(WEDNESDAY),
    weekEnd: endOfIsoWeek(startOfIsoWeek(WEDNESDAY)),
  },
  {
    _id: "ch-reading",
    type: "reading",
    targetCount: 5,
    xpReward: 75,
    description: "reading desc",
    weekStart: startOfIsoWeek(WEDNESDAY),
    weekEnd: endOfIsoWeek(startOfIsoWeek(WEDNESDAY)),
  },
];

describe("startOfIsoWeek", () => {
  it("returns Monday 00:00:00 UTC for a Wednesday input", () => {
    const result = startOfIsoWeek(WEDNESDAY);
    expect(result.getUTCDay()).toBe(1);
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
  });

  it("returns Monday 00:00:00 UTC when given a Sunday", () => {
    const result = startOfIsoWeek(SUNDAY);
    expect(result.getUTCDay()).toBe(1);
  });

  it("returns the same Monday when given a Monday", () => {
    const result = startOfIsoWeek(MONDAY);
    expect(result.getUTCDay()).toBe(1);
    expect(result.toISOString()).toBe("2026-03-16T00:00:00.000Z");
  });
});

describe("endOfIsoWeek", () => {
  it("returns Sunday 23:59:59.999 UTC", () => {
    const weekStart = startOfIsoWeek(WEDNESDAY);
    const result = endOfIsoWeek(weekStart);
    expect(result.getUTCDay()).toBe(0);
    expect(result.getUTCHours()).toBe(23);
    expect(result.getUTCMinutes()).toBe(59);
    expect(result.getUTCSeconds()).toBe(59);
    expect(result.getUTCMilliseconds()).toBe(999);
  });
});

describe("getOrCreateWeeklyChallenges", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns existing challenges when all 3 already exist for the week", async () => {
    const existing = makeChallenges();
    WeeklyChallenge.find.mockReturnValue(makeLean(existing));

    const result = await getOrCreateWeeklyChallenges(WEDNESDAY);

    expect(WeeklyChallenge.find).toHaveBeenCalledTimes(1);
    expect(WeeklyChallenge.insertMany).not.toHaveBeenCalled();
    expect(result).toEqual(existing);
  });

  it("inserts missing challenges when none exist yet", async () => {
    WeeklyChallenge.find
      .mockReturnValueOnce(makeLean([]))
      .mockReturnValueOnce(makeLean(makeChallenges()));

    WeeklyChallenge.insertMany.mockResolvedValue([]);

    const result = await getOrCreateWeeklyChallenges(WEDNESDAY);

    expect(WeeklyChallenge.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: "quiz" }),
        expect.objectContaining({ type: "workout" }),
        expect.objectContaining({ type: "reading" }),
      ]),
      { ordered: false },
    );
    expect(result).toHaveLength(3);
  });

  it("inserts only missing challenge types when some already exist", async () => {
    const existingQuiz = [makeChallenges()[0]];
    WeeklyChallenge.find
      .mockReturnValueOnce(makeLean(existingQuiz))
      .mockReturnValueOnce(makeLean(makeChallenges()));

    WeeklyChallenge.insertMany.mockResolvedValue([]);

    await getOrCreateWeeklyChallenges(WEDNESDAY);

    const insertedTypes = WeeklyChallenge.insertMany.mock.calls[0][0].map(
      (d) => d.type,
    );
    expect(insertedTypes).not.toContain("quiz");
    expect(insertedTypes).toContain("workout");
    expect(insertedTypes).toContain("reading");
  });
});

describe("getUserChallengeStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns challenges with zero progress when no progress docs exist", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.find.mockReturnValue(makeLean([]));

    const result = await getUserChallengeStatus({
      userId: "user-1",
      now: WEDNESDAY,
    });

    expect(result).toHaveLength(3);
    for (const item of result) {
      expect(item.currentCount).toBe(0);
      expect(item.completed).toBe(false);
      expect(item.xpAwarded).toBe(false);
    }
  });

  it("merges user progress into challenge data correctly", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.find.mockReturnValue(
      makeLean([
        {
          challengeId: "ch-quiz",
          currentCount: 2,
          completed: false,
          xpAwarded: false,
        },
        {
          challengeId: "ch-workout",
          currentCount: 2,
          completed: true,
          xpAwarded: true,
        },
      ]),
    );

    const result = await getUserChallengeStatus({
      userId: "user-1",
      now: WEDNESDAY,
    });

    const quiz = result.find((r) => r.type === "quiz");
    const workout = result.find((r) => r.type === "workout");
    const reading = result.find((r) => r.type === "reading");

    expect(quiz.currentCount).toBe(2);
    expect(quiz.completed).toBe(false);
    expect(workout.completed).toBe(true);
    expect(workout.xpAwarded).toBe(true);
    expect(reading.currentCount).toBe(0);
  });

  it("includes weekEnd on each challenge", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.find.mockReturnValue(makeLean([]));

    const result = await getUserChallengeStatus({
      userId: "user-1",
      now: WEDNESDAY,
    });

    for (const item of result) {
      expect(item.weekEnd).toBeInstanceOf(Date);
    }
  });
});

describe("updateChallengeProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("increments currentCount when challenge is not yet complete", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.findOneAndUpdate.mockResolvedValue({
      _id: "progress-1",
      currentCount: 1,
      xpAwarded: false,
    });

    await updateChallengeProgress({ userId: "user-1", type: "quiz" });

    expect(UserChallengeProgress.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", completed: false }),
      expect.objectContaining({ $inc: { currentCount: 1 } }),
      expect.objectContaining({ returnDocument: "after", upsert: true }),
    );
    expect(applyUserProgress).not.toHaveBeenCalled();
  });

  it("awards brainXp when quiz challenge reaches targetCount", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.findOneAndUpdate
      .mockResolvedValueOnce({
        _id: "progress-1",
        currentCount: 3,
        xpAwarded: false,
      })
      .mockResolvedValueOnce({
        _id: "progress-1",
        currentCount: 3,
        completed: true,
        xpAwarded: true,
      });

    applyUserProgress.mockResolvedValue({
      user: { _id: "user-1" },
      newAchievements: [],
    });

    await updateChallengeProgress({ userId: "user-1", type: "quiz" });

    expect(UserChallengeProgress.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(applyUserProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        brainXp: 100,
        bodyXp: 0,
        source: "weekly_challenge",
      }),
    );
  });

  it("awards bodyXp when workout challenge reaches targetCount", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.findOneAndUpdate
      .mockResolvedValueOnce({
        _id: "progress-2",
        currentCount: 2,
        xpAwarded: false,
      })
      .mockResolvedValueOnce({
        _id: "progress-2",
        currentCount: 2,
        completed: true,
        xpAwarded: true,
      });

    applyUserProgress.mockResolvedValue({
      user: { _id: "user-1" },
      newAchievements: [],
    });

    await updateChallengeProgress({ userId: "user-1", type: "workout" });

    expect(applyUserProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        brainXp: 0,
        bodyXp: 150,
      }),
    );
  });

  it("does nothing when progress doc returns null (already completed)", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.findOneAndUpdate.mockResolvedValue(null);

    await updateChallengeProgress({ userId: "user-1", type: "quiz" });

    expect(applyUserProgress).not.toHaveBeenCalled();
  });

  it("does nothing when challenge type is not found", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean([]));

    await updateChallengeProgress({ userId: "user-1", type: "quiz" });

    expect(UserChallengeProgress.findOneAndUpdate).not.toHaveBeenCalled();
    expect(applyUserProgress).not.toHaveBeenCalled();
  });

  it("does not award XP when xpAwarded is already true", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.findOneAndUpdate.mockResolvedValue({
      _id: "progress-1",
      currentCount: 3,
      xpAwarded: true,
    });

    await updateChallengeProgress({ userId: "user-1", type: "quiz" });

    expect(applyUserProgress).not.toHaveBeenCalled();
  });
});
