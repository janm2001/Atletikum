const { WeeklyChallenge } = require("../models/WeeklyChallenge");
const { UserChallengeProgress } = require("../models/UserChallengeProgress");
const { applyUserProgress } = require("./userProgressService");

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
    !progressDoc.xpAwarded && progressDoc.currentCount >= challenge.targetCount;

  if (!isNowComplete) {
    return;
  }

  await UserChallengeProgress.findOneAndUpdate(
    { _id: progressDoc._id, xpAwarded: false },
    {
      $set: {
        completed: true,
        completedAt: new Date(),
        xpAwarded: true,
      },
    },
    { returnDocument: "after" },
  );

  const brainXp =
    type === "quiz" || type === "reading" ? challenge.xpReward : 0;
  const bodyXp = type === "workout" ? challenge.xpReward : 0;

  await applyUserProgress({
    userId,
    brainXp,
    bodyXp,
    shouldUpdateStreak: false,
    shouldUnlockAchievements: false,
    session,
    source: "weekly_challenge",
    sourceEntityId: challenge._id,
    description: `Weekly challenge completed: ${type}`,
  });
};

module.exports = {
  startOfIsoWeek,
  endOfIsoWeek,
  getOrCreateWeeklyChallenges,
  getUserChallengeStatus,
  updateChallengeProgress,
  CHALLENGE_TEMPLATES,
};
