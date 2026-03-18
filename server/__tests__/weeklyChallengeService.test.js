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
    aggregate: jest.fn(),
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
  getChallengeHistory,
  getWeeklyLeaderboard,
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

describe("getChallengeHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const week1Start = new Date("2026-03-16T00:00:00.000Z");
  const week1End = new Date("2026-03-22T23:59:59.999Z");
  const week2Start = new Date("2026-03-09T00:00:00.000Z");
  const week2End = new Date("2026-03-15T23:59:59.999Z");

  const makeHistoryChallenges = () => [
    { _id: "w1-quiz", type: "quiz", targetCount: 3, xpReward: 100, weekStart: week1Start, weekEnd: week1End },
    { _id: "w1-workout", type: "workout", targetCount: 2, xpReward: 150, weekStart: week1Start, weekEnd: week1End },
    { _id: "w1-reading", type: "reading", targetCount: 5, xpReward: 75, weekStart: week1Start, weekEnd: week1End },
    { _id: "w2-quiz", type: "quiz", targetCount: 3, xpReward: 100, weekStart: week2Start, weekEnd: week2End },
    { _id: "w2-workout", type: "workout", targetCount: 2, xpReward: 150, weekStart: week2Start, weekEnd: week2End },
    { _id: "w2-reading", type: "reading", targetCount: 5, xpReward: 75, weekStart: week2Start, weekEnd: week2End },
  ];

  const makeSortLimitLean = (data) => ({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(data),
      }),
    }),
  });

  it("returns empty items when no challenges exist", async () => {
    WeeklyChallenge.find.mockReturnValue(makeSortLimitLean([]));

    const result = await getChallengeHistory({ userId: "user-1" });

    expect(result.items).toHaveLength(0);
    expect(result.pageInfo.hasNextPage).toBe(false);
  });

  it("returns weekly history grouped by week with progress", async () => {
    WeeklyChallenge.find.mockReturnValue(makeSortLimitLean(makeHistoryChallenges()));
    UserChallengeProgress.find.mockReturnValue(makeLean([
      { challengeId: "w1-quiz", currentCount: 3, completed: true, claimed: true },
      { challengeId: "w1-workout", currentCount: 1, completed: false, claimed: false },
    ]));

    const result = await getChallengeHistory({ userId: "user-1" });

    expect(result.items).toHaveLength(2);

    const week1 = result.items[0];
    expect(week1.weekStart).toBe(week1Start.toISOString());
    expect(week1.challengesCompleted).toBe(1);
    expect(week1.totalChallenges).toBe(3);
    expect(week1.completionRate).toBe(33);
    expect(week1.xpFromChallenges).toBe(100);
    expect(week1.allCompleted).toBe(false);
    expect(week1.entries).toHaveLength(3);
  });

  it("calculates 100% completion when all challenges are completed", async () => {
    const allCompleted = makeHistoryChallenges().slice(0, 3);
    WeeklyChallenge.find.mockReturnValue(makeSortLimitLean(allCompleted));
    UserChallengeProgress.find.mockReturnValue(makeLean([
      { challengeId: "w1-quiz", currentCount: 3, completed: true, claimed: true },
      { challengeId: "w1-workout", currentCount: 2, completed: true, claimed: true },
      { challengeId: "w1-reading", currentCount: 5, completed: true, claimed: true },
    ]));

    const result = await getChallengeHistory({ userId: "user-1" });

    expect(result.items[0].completionRate).toBe(100);
    expect(result.items[0].allCompleted).toBe(true);
    expect(result.items[0].xpFromChallenges).toBe(325);
  });

  it("clamps limit to max 26", async () => {
    WeeklyChallenge.find.mockReturnValue(makeSortLimitLean([]));

    await getChallengeHistory({ userId: "user-1", limit: 50 });

    const limitCall = WeeklyChallenge.find.mock.results[0].value.sort.mock.results[0].value.limit;
    expect(limitCall).toHaveBeenCalledWith(expect.any(Number));
  });
});

describe("getWeeklyLeaderboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty ranking when no challenges exist for the week", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean([]));

    const result = await getWeeklyLeaderboard({ userId: "user-1" });

    expect(result.ranking).toHaveLength(0);
    expect(result.currentUser).toBe(null);
    expect(result.week).toBeDefined();
  });

  it("returns ranked users from aggregation pipeline", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));

    UserChallengeProgress.aggregate.mockResolvedValue([
      {
        userId: "user-2",
        username: "alice",
        profilePicture: null,
        completedChallenges: 3,
        xpFromChallenges: 325,
        totalXp: 1000,
        dailyStreak: 5,
      },
      {
        userId: "user-1",
        username: "bob",
        profilePicture: null,
        completedChallenges: 2,
        xpFromChallenges: 250,
        totalXp: 800,
        dailyStreak: 3,
      },
    ]);

    UserChallengeProgress.find.mockReturnValue(makeLean([]));

    const result = await getWeeklyLeaderboard({ userId: "user-1" });

    expect(result.ranking).toHaveLength(2);
    expect(result.ranking[0].rank).toBe(1);
    expect(result.ranking[0].username).toBe("alice");
    expect(result.ranking[1].rank).toBe(2);
    expect(result.ranking[1].username).toBe("bob");
    expect(result.currentUser).toBeDefined();
    expect(result.currentUser.rank).toBe(2);
  });

  it("returns currentUser outside ranking when not in top results", async () => {
    WeeklyChallenge.find.mockReturnValue(makeLean(makeChallenges()));

    UserChallengeProgress.aggregate.mockResolvedValue([
      {
        userId: "user-other",
        username: "alice",
        profilePicture: null,
        completedChallenges: 3,
        xpFromChallenges: 325,
        totalXp: 1000,
        dailyStreak: 5,
      },
    ]);

    UserChallengeProgress.find.mockReturnValue(makeLean([
      { challengeId: "ch-quiz", claimed: true },
    ]));

    const result = await getWeeklyLeaderboard({ userId: "user-1" });

    expect(result.currentUser.rank).toBe(2);
    expect(result.currentUser.completedChallenges).toBe(1);
    expect(result.currentUser.xpFromChallenges).toBe(100);
  });
});
