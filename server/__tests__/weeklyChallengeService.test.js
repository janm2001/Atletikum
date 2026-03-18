jest.mock("../models/WeeklyChallenge", () => {
  const WeeklyChallenge = {
    find: jest.fn(),
    findOne: jest.fn(),
    insertMany: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  return { WeeklyChallenge };
});

jest.mock("../models/UserChallengeProgress", () => {
  const UserChallengeProgress = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };
  return { UserChallengeProgress };
});

jest.mock("../models/User", () => {
  const User = {
    findById: jest.fn(),
  };
  return { User };
});

jest.mock("../services/userProgressService", () => ({
  applyUserProgress: jest.fn(),
}));

jest.mock("../utils/mongoTransaction", () => ({
  runInTransaction: jest.fn((work) => work(null)),
}));

const { WeeklyChallenge } = require("../models/WeeklyChallenge");
const { UserChallengeProgress } = require("../models/UserChallengeProgress");
const { User } = require("../models/User");
const { applyUserProgress } = require("../services/userProgressService");
const {
  startOfIsoWeek,
  endOfIsoWeek,
  getOrCreateWeeklyChallenges,
  getUserChallengeStatus,
  updateChallengeProgress,
  claimChallengeReward,
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
      expect(item.claimed).toBe(false);
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
          claimed: false,
        },
        {
          challengeId: "ch-workout",
          currentCount: 2,
          completed: true,
          xpAwarded: true,
          claimed: true,
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
    expect(quiz.claimed).toBe(false);
    expect(workout.completed).toBe(true);
    expect(workout.xpAwarded).toBe(true);
    expect(workout.claimed).toBe(true);
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
      completed: false,
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

  it("marks challenge completed but does NOT award XP when target is reached", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.findOneAndUpdate
      .mockResolvedValueOnce({
        _id: "progress-1",
        currentCount: 3,
        completed: false,
        xpAwarded: false,
      })
      .mockResolvedValueOnce({
        _id: "progress-1",
        currentCount: 3,
        completed: true,
        xpAwarded: false,
      });

    await updateChallengeProgress({ userId: "user-1", type: "quiz" });

    expect(UserChallengeProgress.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(applyUserProgress).not.toHaveBeenCalled();
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
});

describe("claimChallengeReward", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 400 for invalid challengeId", async () => {
    await expect(
      claimChallengeReward({ userId: "user-1", challengeId: "not-valid" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Neispravan identifikator izazova.",
    });
  });

  it("throws 404 when challenge is not found for current week", async () => {
    const objectId = "507f1f77bcf86cd799439011";
    WeeklyChallenge.findOne.mockReturnValue(makeLean(null));

    await expect(
      claimChallengeReward({ userId: "user-1", challengeId: objectId }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Izazov nije pronađen za trenutni tjedan.",
    });
  });

  it("throws 409 when challenge is not completed", async () => {
    const objectId = "507f1f77bcf86cd799439011";
    WeeklyChallenge.findOne.mockReturnValue(
      makeLean({ _id: objectId, type: "quiz", xpReward: 100, weekStart: new Date() }),
    );
    UserChallengeProgress.findOne.mockReturnValue(
      makeLean({ userId: "user-1", challengeId: objectId, completed: false, claimed: false }),
    );

    await expect(
      claimChallengeReward({ userId: "user-1", challengeId: objectId }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Izazov još nije dovršen i nagradu nije moguće preuzeti.",
    });
  });

  it("returns idempotent response when already claimed", async () => {
    const objectId = "507f1f77bcf86cd799439011";
    WeeklyChallenge.findOne.mockReturnValue(
      makeLean({ _id: objectId, type: "quiz", xpReward: 100, weekStart: new Date() }),
    );
    UserChallengeProgress.findOne.mockReturnValue(
      makeLean({
        userId: "user-1",
        challengeId: objectId,
        completed: true,
        claimed: true,
        xpAwarded: true,
      }),
    );
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "user-1",
        brainXp: 200,
        bodyXp: 100,
        totalXp: 300,
        level: 2,
      }),
    });

    const result = await claimChallengeReward({
      userId: "user-1",
      challengeId: objectId,
    });

    expect(result.claim.alreadyClaimed).toBe(true);
    expect(applyUserProgress).not.toHaveBeenCalled();
  });

  it("awards XP and returns celebration data on first claim", async () => {
    const objectId = "507f1f77bcf86cd799439011";
    WeeklyChallenge.findOne.mockReturnValue(
      makeLean({
        _id: objectId,
        type: "quiz",
        xpReward: 100,
        weekStart: startOfIsoWeek(new Date()),
      }),
    );
    UserChallengeProgress.findOne.mockReturnValue(
      makeLean({
        _id: "prog-1",
        userId: "user-1",
        challengeId: objectId,
        completed: true,
        claimed: false,
        xpAwarded: false,
      }),
    );
    UserChallengeProgress.findOneAndUpdate.mockResolvedValue({
      _id: "prog-1",
      claimed: true,
      xpAwarded: true,
    });

    const userObj = {
      _id: "user-1",
      brainXp: 200,
      bodyXp: 100,
      totalXp: 300,
      level: 2,
    };
    User.findById.mockReturnValue({
      session: jest.fn().mockResolvedValue(userObj),
    });

    applyUserProgress.mockResolvedValue({
      user: { _id: "user-1" },
      newAchievements: [],
    });

    // For the all-challenges bonus check
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));
    UserChallengeProgress.find.mockReturnValue({
      session: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { challengeId: "ch-quiz", claimed: true },
          { challengeId: "ch-workout", claimed: false },
        ]),
      }),
    });

    const result = await claimChallengeReward({
      userId: "user-1",
      challengeId: objectId,
    });

    expect(result.claim.alreadyClaimed).toBe(false);
    expect(result.claim.xpAwarded).toBe(100);
    expect(result.claim.type).toBe("quiz");
    expect(result.celebration.showCelebration).toBe(true);
    expect(result.celebration.reasons).toContain("challenge_complete");
    expect(result.allChallengesCompleted.completed).toBe(false);
    expect(applyUserProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        brainXp: 100,
        bodyXp: 0,
        source: "weekly_challenge",
      }),
    );
  });

  it("throws 409 when no progress exists at all", async () => {
    const objectId = "507f1f77bcf86cd799439011";
    WeeklyChallenge.findOne.mockReturnValue(
      makeLean({ _id: objectId, type: "quiz", xpReward: 100, weekStart: new Date() }),
    );
    UserChallengeProgress.findOne.mockReturnValue(makeLean(null));

    await expect(
      claimChallengeReward({ userId: "user-1", challengeId: objectId }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Izazov još nije dovršen i nagradu nije moguće preuzeti.",
    });
  });
});
