const { Achievement } = require("../models/Achievement");
const { User } = require("../models/User");
const { WorkoutLog } = require("../models/WorkoutLog");
const { QuizCompletion } = require("../models/QuizCompletion");
const { addUtcDays, startOfUtcDay } = require("./dateUtils");
const { attachSession, saveWithSession } = require("./mongoTransaction");
const { requireUserId } = require("./userIdentity");
const {
  applyAchievementReward,
  buildUnlockedAchievement,
  didEarnAchievement,
  filterPendingAchievements,
  getAchievementRequirements,
  getUnlockedAchievementIds,
  hasPerfectQuizCompletion,
} = require("./achievementEvaluation");
const { recordXpEvent } = require("../services/xpLedgerService");

const MAX_ACHIEVEMENT_XP_PER_BATCH = 500;

const getTodayRange = (now = new Date()) => {
  const today = startOfUtcDay(now);

  return {
    today,
    tomorrow: addUtcDays(today, 1),
  };
};

const checkSameDayActivity = async (userId, session) => {
  const { today, tomorrow } = getTodayRange();

  const [todayWorkout, todayQuiz] = await Promise.all([
    attachSession(
      WorkoutLog.exists({
        user: userId,
        date: { $gte: today, $lt: tomorrow },
      }),
      session,
    ),
    attachSession(
      QuizCompletion.exists({
        user: userId,
        completedAt: { $gte: today, $lt: tomorrow },
      }),
      session,
    ),
  ]);

  return !!(todayWorkout && todayQuiz);
};

const getAchievementContext = async ({ userId, pendingAchievements, session }) => {
  const requirements = getAchievementRequirements(pendingAchievements);

  const [workoutCount, quizCount, quizCompletions, sameDayBoth] =
    await Promise.all([
      requirements.needsWorkoutCount
        ? attachSession(WorkoutLog.countDocuments({ user: userId }), session)
        : 0,
      requirements.needsQuizCount
        ? attachSession(QuizCompletion.countDocuments({ user: userId }), session)
        : 0,
      requirements.needsPerfectQuiz
        ? attachSession(
            QuizCompletion.find({ user: userId })
              .sort({ completedAt: -1 })
              .limit(50)
              .lean(),
            session,
          )
        : [],
      requirements.needsSameDayBoth
        ? checkSameDayActivity(userId, session)
        : false,
    ]);

  return {
    workoutCount,
    quizCount,
    hasPerfectQuiz: hasPerfectQuizCompletion(quizCompletions),
    sameDayBoth,
  };
};

const checkAndUnlockAchievements = async (
  userId,
  { session = null, user: existingUser = null } = {},
) => {
  const normalizedUserId = requireUserId({ userId });
  const user =
    existingUser ??
    (await attachSession(User.findById(normalizedUserId), session));
  if (!user) return [];

  const allAchievements = await attachSession(Achievement.find().lean(), session);
  const unlockedIds = getUnlockedAchievementIds(user.achievements);
  const pendingAchievements = filterPendingAchievements(allAchievements, unlockedIds);

  if (pendingAchievements.length === 0) {
    return [];
  }

  const achievementContext = await getAchievementContext({
    userId: normalizedUserId,
    pendingAchievements,
    session,
  });

  const newlyUnlocked = [];
  const ledgerPromises = [];
  let remainingXpBudget = MAX_ACHIEVEMENT_XP_PER_BATCH;

  for (const achievement of pendingAchievements) {
    if (
      !didEarnAchievement(achievement, {
        user,
        ...achievementContext,
      })
    ) {
      continue;
    }

    const cappedXp = Math.min(achievement.xpReward, remainingXpBudget);
    applyAchievementReward(user, achievement, cappedXp);
    remainingXpBudget -= cappedXp;
    newlyUnlocked.push(buildUnlockedAchievement(achievement));

    if (cappedXp > 0) {
      const category = achievement.xpCategory === "brain" ? "brain" :
        achievement.xpCategory === "body" ? "body" : null;

      if (category) {
        ledgerPromises.push(
          recordXpEvent({
            userId: normalizedUserId,
            source: "achievement",
            amount: cappedXp,
            category,
            sourceEntityId: achievement._id.toString(),
            description: `Achievement: ${achievement.title}`,
            session,
          }),
        );
      } else {
        const half = Math.floor(cappedXp / 2);
        const remainder = cappedXp - half;
        ledgerPromises.push(
          recordXpEvent({
            userId: normalizedUserId,
            source: "achievement",
            amount: half,
            category: "brain",
            sourceEntityId: achievement._id.toString(),
            description: `Achievement: ${achievement.title}`,
            session,
          }),
        );
        if (remainder > 0) {
          ledgerPromises.push(
            recordXpEvent({
              userId: normalizedUserId,
              source: "achievement",
              amount: remainder,
              category: "body",
              sourceEntityId: achievement._id.toString(),
              description: `Achievement: ${achievement.title}`,
              session,
            }),
          );
        }
      }
    }
  }

  if (newlyUnlocked.length > 0) {
    await saveWithSession(user, session);
  }

  if (ledgerPromises.length > 0) {
    await Promise.all(ledgerPromises);
  }

  return newlyUnlocked;
};

module.exports = { MAX_ACHIEVEMENT_XP_PER_BATCH, checkAndUnlockAchievements };
