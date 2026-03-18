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

module.exports = {
  startOfIsoWeek,
  endOfIsoWeek,
  getOrCreateWeeklyChallenges,
  getUserChallengeStatus,
  updateChallengeProgress,
  claimChallengeReward,
  CHALLENGE_TEMPLATES,
  ALL_CHALLENGES_BONUS_XP,
};
