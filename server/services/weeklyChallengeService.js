const mongoose = require("mongoose");
const { WeeklyChallenge } = require("../models/WeeklyChallenge");
const { UserChallengeProgress } = require("../models/UserChallengeProgress");
const { User } = require("../models/User");
const { applyUserProgress } = require("./userProgressService");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { runInTransaction } = require("../utils/mongoTransaction");
const AppError = require("../utils/AppError");

const CHALLENGE_TEMPLATES = [
  {
    type: "quiz",
    targetCount: 3,
    xpReward: 100,
    description: "Complete 3 quizzes this week",
  },
  {
    type: "workout",
    targetCount: 2,
    xpReward: 150,
    description: "Log 2 workouts this week",
  },
  {
    type: "reading",
    targetCount: 5,
    xpReward: 75,
    description: "Read 5 articles this week",
  },
];

const startOfIsoWeek = (date) => {
  const d = new Date(date);
  // getDay() returns 0=Sunday, 1=Monday, ... 6=Saturday
  // ISO week starts on Monday
  const day = d.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const endOfIsoWeek = (weekStart) => {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 6);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

const getOrCreateWeeklyChallenges = async (now) => {
  const weekStart = startOfIsoWeek(now);
  const weekEnd = endOfIsoWeek(weekStart);

  const existing = await WeeklyChallenge.find({ weekStart }).lean();

  if (existing.length === CHALLENGE_TEMPLATES.length) {
    return existing;
  }

  const existingTypes = new Set(existing.map((c) => c.type));

  const toCreate = CHALLENGE_TEMPLATES.filter(
    (template) => !existingTypes.has(template.type),
  ).map((template) => ({
    ...template,
    weekStart,
    weekEnd,
  }));

  if (toCreate.length > 0) {
    await WeeklyChallenge.insertMany(toCreate, { ordered: false }).catch(
      (err) => {
        if (
          err?.code !== 11000 &&
          err?.writeErrors?.every?.((e) => e?.code === 11000)
        ) {
          throw err;
        }
      },
    );
  }

  return WeeklyChallenge.find({ weekStart }).lean();
};

const getUserChallengeStatus = async ({ userId, now }) => {
  const challenges = await getOrCreateWeeklyChallenges(now);

  const challengeIds = challenges.map((c) => c._id);

  const progressDocs = await UserChallengeProgress.find({
    userId,
    challengeId: { $in: challengeIds },
  }).lean();

  const progressMap = new Map(
    progressDocs.map((p) => [String(p.challengeId), p]),
  );

  return challenges.map((challenge) => {
    const progress = progressMap.get(String(challenge._id));

    return {
      _id: challenge._id,
      type: challenge.type,
      targetCount: challenge.targetCount,
      xpReward: challenge.xpReward,
      description: challenge.description,
      weekEnd: challenge.weekEnd,
      currentCount: progress?.currentCount ?? 0,
      completed: progress?.completed ?? false,
      xpAwarded: progress?.xpAwarded ?? false,
      claimed: progress?.claimed ?? false,
    };
  });
};

const updateChallengeProgress = async ({ userId, type, session = null }) => {
  const now = new Date();
  const challenges = await getOrCreateWeeklyChallenges(now);

  const challenge = challenges.find((c) => c.type === type);
  if (!challenge) {
    return;
  }

  const filter = { userId, challengeId: challenge._id };

  const progressDoc = await UserChallengeProgress.findOneAndUpdate(
    { ...filter, completed: false },
    {
      $inc: { currentCount: 1 },
      $setOnInsert: {
        userId,
        challengeId: challenge._id,
        xpAwarded: false,
        completedAt: null,
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  ).catch((err) => {
    if (err?.code === 11000) {
      return null;
    }
    throw err;
  });

  if (!progressDoc) {
    return;
  }

  const isNowComplete =
    !progressDoc.completed && progressDoc.currentCount >= challenge.targetCount;

  if (!isNowComplete) {
    return;
  }

  await UserChallengeProgress.findOneAndUpdate(
    { _id: progressDoc._id, completed: false },
    {
      $set: {
        completed: true,
        completedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
};

const ALL_CHALLENGES_BONUS_XP = 50;

const claimChallengeReward = async ({ userId, challengeId }) => {
  if (!mongoose.Types.ObjectId.isValid(challengeId)) {
    throw new AppError("Neispravan identifikator izazova.", 400);
  }

  const now = new Date();
  const weekStart = startOfIsoWeek(now);

  const challenge = await WeeklyChallenge.findOne({
    _id: challengeId,
    weekStart,
  }).lean();

  if (!challenge) {
    throw new AppError("Izazov nije pronađen za trenutni tjedan.", 404);
  }

  const progress = await UserChallengeProgress.findOne({
    userId,
    challengeId: challenge._id,
  }).lean();

  if (!progress || !progress.completed) {
    throw new AppError(
      "Izazov još nije dovršen i nagradu nije moguće preuzeti.",
      409,
    );
  }

  if (progress.claimed) {
    const user = await User.findById(userId).lean();
    return buildClaimResponse({
      challenge,
      user,
      xpAwarded: challenge.xpReward,
      alreadyClaimed: true,
      leveledUp: false,
      levelFrom: null,
      levelTo: null,
      allChallengesCompleted: false,
      bonusAwarded: false,
    });
  }

  return runInTransaction(async (session) => {
    const claimed = await UserChallengeProgress.findOneAndUpdate(
      { _id: progress._id, claimed: false },
      {
        $set: {
          claimed: true,
          claimedAt: new Date(),
          xpAwarded: true,
        },
      },
      { returnDocument: "after", session },
    );

    if (!claimed) {
      const user = await User.findById(userId).lean();
      return buildClaimResponse({
        challenge,
        user,
        xpAwarded: challenge.xpReward,
        alreadyClaimed: true,
        leveledUp: false,
        levelFrom: null,
        levelTo: null,
        allChallengesCompleted: false,
        bonusAwarded: false,
      });
    }

    const userBefore = await User.findById(userId).session(session);
    const levelBefore = userBefore.level;

    const brainXp =
      challenge.type === "quiz" || challenge.type === "reading"
        ? challenge.xpReward
        : 0;
    const bodyXp = challenge.type === "workout" ? challenge.xpReward : 0;

    await applyUserProgress({
      userId,
      brainXp,
      bodyXp,
      shouldUpdateStreak: false,
      shouldUnlockAchievements: false,
      session,
      source: "weekly_challenge",
      sourceEntityId: challenge._id,
      description: `Weekly challenge completed: ${challenge.type}`,
    });

    const { allCompleted, bonusAwarded } = await checkAndAwardAllChallengesBonus(
      { userId, weekStart, session },
    );

    const userAfter = await User.findById(userId).session(session);
    const leveledUp = userAfter.level > levelBefore;

    return buildClaimResponse({
      challenge,
      user: userAfter,
      xpAwarded: challenge.xpReward,
      alreadyClaimed: false,
      leveledUp,
      levelFrom: leveledUp ? levelBefore : null,
      levelTo: leveledUp ? userAfter.level : null,
      allChallengesCompleted: allCompleted,
      bonusAwarded,
    });
  });
};

const checkAndAwardAllChallengesBonus = async ({
  userId,
  weekStart,
  session,
}) => {
  const challenges = await WeeklyChallenge.find({ weekStart }).lean();
  const challengeIds = challenges.map((c) => c._id);

  const progressDocs = await UserChallengeProgress.find({
    userId,
    challengeId: { $in: challengeIds },
  })
    .session(session)
    .lean();

  const allCompleted =
    progressDocs.length === challenges.length &&
    progressDocs.every((p) => p.claimed);

  if (!allCompleted) {
    return { allCompleted: false, bonusAwarded: false };
  }

  const alreadyBonused = progressDocs.some((p) => p.bonusAwarded);
  if (alreadyBonused) {
    return { allCompleted: true, bonusAwarded: false };
  }

  await UserChallengeProgress.updateOne(
    { _id: progressDocs[0]._id },
    { $set: { bonusAwarded: true } },
    { session },
  );

  const bonusBrainXp = Math.ceil(ALL_CHALLENGES_BONUS_XP / 2);
  const bonusBodyXp = Math.floor(ALL_CHALLENGES_BONUS_XP / 2);

  await applyUserProgress({
    userId,
    brainXp: bonusBrainXp,
    bodyXp: bonusBodyXp,
    shouldUpdateStreak: false,
    shouldUnlockAchievements: false,
    session,
    source: "weekly_challenge",
    sourceEntityId: null,
    description: "All weekly challenges completed bonus",
  });

  return { allCompleted: true, bonusAwarded: true };
};

const buildClaimResponse = ({
  challenge,
  user,
  xpAwarded,
  alreadyClaimed,
  leveledUp,
  levelFrom,
  levelTo,
  allChallengesCompleted,
  bonusAwarded,
}) => {
  const reasons = [];
  if (!alreadyClaimed) reasons.push("challenge_complete");
  if (leveledUp) reasons.push("level_up");
  if (allChallengesCompleted && bonusAwarded)
    reasons.push("all_weekly_challenges_complete");

  return {
    claim: {
      challengeId: String(challenge._id),
      type: challenge.type,
      claimedAt: new Date().toISOString(),
      xpAwarded,
      alreadyClaimed,
    },
    progress: {
      userId: String(user._id),
      brainXp: user.brainXp,
      bodyXp: user.bodyXp,
      totalXp: user.totalXp,
      level: user.level,
      leveledUp,
      levelFrom,
      levelTo,
    },
    celebration: {
      showCelebration: reasons.length > 0,
      reasons,
    },
    allChallengesCompleted: {
      completed: allChallengesCompleted,
      bonusAwarded,
      bonusXp: bonusAwarded ? ALL_CHALLENGES_BONUS_XP : 0,
    },
  };
};

const HISTORY_DEFAULT_LIMIT = 8;
const HISTORY_MAX_LIMIT = 26;
const LEADERBOARD_DEFAULT_LIMIT = 20;
const LEADERBOARD_MAX_LIMIT = 100;

const getChallengeHistory = async ({ userId, limit, cursorWeekStart }) => {
  const safeLimit = Math.min(
    Math.max(1, Number(limit) || HISTORY_DEFAULT_LIMIT),
    HISTORY_MAX_LIMIT,
  );

  const weekFilter = cursorWeekStart
    ? { weekStart: { $lt: new Date(cursorWeekStart) } }
    : {};

  const weeks = await WeeklyChallenge.find(weekFilter)
    .sort({ weekStart: -1 })
    .limit(safeLimit * CHALLENGE_TEMPLATES.length + CHALLENGE_TEMPLATES.length)
    .lean();

  if (weeks.length === 0) {
    return { items: [], pageInfo: { hasNextPage: false, nextCursorWeekStart: null } };
  }

  const weekGroups = new Map();
  for (const ch of weeks) {
    const key = ch.weekStart.toISOString();
    if (!weekGroups.has(key)) {
      weekGroups.set(key, []);
    }
    weekGroups.get(key).push(ch);
  }

  const sortedWeekKeys = [...weekGroups.keys()].sort((a, b) =>
    b.localeCompare(a),
  );

  const pagedKeys = sortedWeekKeys.slice(0, safeLimit);
  const hasNextPage = sortedWeekKeys.length > safeLimit;
  const nextCursorWeekStart = hasNextPage ? pagedKeys[pagedKeys.length - 1] : null;

  const allChallengeIds = pagedKeys.flatMap((key) =>
    weekGroups.get(key).map((c) => c._id),
  );

  const progressDocs = await UserChallengeProgress.find({
    userId,
    challengeId: { $in: allChallengeIds },
  }).lean();

  const progressMap = new Map(
    progressDocs.map((p) => [String(p.challengeId), p]),
  );

  const items = pagedKeys.map((weekKey) => {
    const challenges = weekGroups.get(weekKey);
    const weekStart = challenges[0].weekStart;
    const weekEnd = challenges[0].weekEnd;

    const entries = challenges.map((ch) => {
      const prog = progressMap.get(String(ch._id));
      return {
        challengeId: String(ch._id),
        type: ch.type,
        targetCount: ch.targetCount,
        currentCount: prog?.currentCount ?? 0,
        completed: prog?.completed ?? false,
        claimed: prog?.claimed ?? false,
        xpReward: ch.xpReward,
      };
    });

    const completedCount = entries.filter((e) => e.completed).length;
    const totalChallenges = entries.length;
    const completionRate =
      totalChallenges > 0
        ? Math.round((completedCount / totalChallenges) * 100)
        : 0;
    const xpFromChallenges = entries
      .filter((e) => e.claimed)
      .reduce((sum, e) => sum + e.xpReward, 0);

    return {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      completionRate,
      challengesCompleted: completedCount,
      totalChallenges,
      xpFromChallenges,
      allCompleted: completedCount === totalChallenges && totalChallenges > 0,
      entries,
    };
  });

  return {
    items,
    pageInfo: { hasNextPage, nextCursorWeekStart },
  };
};

const getWeeklyLeaderboard = async ({ userId, weekStart, limit }) => {
  const safeLimit = Math.min(
    Math.max(1, Number(limit) || LEADERBOARD_DEFAULT_LIMIT),
    LEADERBOARD_MAX_LIMIT,
  );

  const resolvedWeekStart = weekStart
    ? startOfIsoWeek(new Date(weekStart))
    : startOfIsoWeek(new Date());
  const resolvedWeekEnd = endOfIsoWeek(resolvedWeekStart);

  const challenges = await WeeklyChallenge.find({
    weekStart: resolvedWeekStart,
  }).lean();

  if (challenges.length === 0) {
    return {
      week: {
        weekStart: resolvedWeekStart.toISOString(),
        weekEnd: resolvedWeekEnd.toISOString(),
      },
      ranking: [],
      currentUser: null,
    };
  }

  const challengeIds = challenges.map((c) => c._id);

  const ranking = await UserChallengeProgress.aggregate([
    { $match: { challengeId: { $in: challengeIds }, claimed: true } },
    {
      $lookup: {
        from: "weeklychallenges",
        localField: "challengeId",
        foreignField: "_id",
        as: "challenge",
      },
    },
    { $unwind: "$challenge" },
    {
      $group: {
        _id: "$userId",
        completedChallenges: { $sum: 1 },
        xpFromChallenges: { $sum: "$challenge.xpReward" },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { uid: { $toObjectId: "$_id" } },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
          {
            $project: {
              username: 1,
              profilePicture: 1,
              totalXp: 1,
              dailyStreak: 1,
            },
          },
        ],
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $sort: {
        completedChallenges: -1,
        xpFromChallenges: -1,
        "user.totalXp": -1,
        _id: 1,
      },
    },
    { $limit: safeLimit },
    {
      $project: {
        userId: "$_id",
        username: "$user.username",
        profilePicture: "$user.profilePicture",
        completedChallenges: 1,
        xpFromChallenges: 1,
        totalXp: "$user.totalXp",
        dailyStreak: "$user.dailyStreak",
      },
    },
  ]);

  const rankedList = ranking.map((entry, idx) => ({
    rank: idx + 1,
    userId: String(entry.userId),
    username: entry.username,
    profilePicture: entry.profilePicture ?? null,
    completedChallenges: entry.completedChallenges,
    xpFromChallenges: entry.xpFromChallenges,
    totalXp: entry.totalXp,
    dailyStreak: entry.dailyStreak,
  }));

  let currentUser = null;
  const myEntry = rankedList.find((r) => r.userId === String(userId));

  if (myEntry) {
    const nextRank = rankedList.find((r) => r.rank === myEntry.rank - 1);
    currentUser = {
      rank: myEntry.rank,
      completedChallenges: myEntry.completedChallenges,
      xpFromChallenges: myEntry.xpFromChallenges,
      gapToNextRank: nextRank
        ? nextRank.xpFromChallenges - myEntry.xpFromChallenges
        : 0,
    };
  } else {
    const myProgress = await UserChallengeProgress.find({
      userId: String(userId),
      challengeId: { $in: challengeIds },
      claimed: true,
    }).lean();

    const myCompleted = myProgress.length;
    const myXp = myProgress.reduce((sum, p) => {
      const ch = challenges.find(
        (c) => String(c._id) === String(p.challengeId),
      );
      return sum + (ch?.xpReward ?? 0);
    }, 0);

    currentUser = {
      rank: rankedList.length + 1,
      completedChallenges: myCompleted,
      xpFromChallenges: myXp,
      gapToNextRank:
        rankedList.length > 0
          ? rankedList[rankedList.length - 1].xpFromChallenges - myXp
          : 0,
    };
  }

  return {
    week: {
      weekStart: resolvedWeekStart.toISOString(),
      weekEnd: resolvedWeekEnd.toISOString(),
    },
    ranking: rankedList,
    currentUser,
  };
};

module.exports = {
  startOfIsoWeek,
  endOfIsoWeek,
  getOrCreateWeeklyChallenges,
  getUserChallengeStatus,
  updateChallengeProgress,
  claimChallengeReward,
  getChallengeHistory,
  getWeeklyLeaderboard,
  CHALLENGE_TEMPLATES,
  ALL_CHALLENGES_BONUS_XP,
};
