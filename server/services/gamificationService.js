const { startOfUtcDay, addUtcDays } = require("../utils/dateUtils");
const {
  getXpRequiredForLevelUp,
  getTotalXpForLevelStart,
} = require("../utils/leveling");

const getGamificationStatus = (user, { now = new Date() } = {}) => {
  const todayStart = startOfUtcDay(now);
  const tomorrowStart = addUtcDays(todayStart, 1);

  const lastActivity = user.lastActivityDate
    ? new Date(user.lastActivityDate)
    : null;

  const hasActivityToday =
    lastActivity !== null &&
    lastActivity >= todayStart &&
    lastActivity < tomorrowStart;

  const streakExpiresAt = lastActivity
    ? addUtcDays(startOfUtcDay(lastActivity), 2)
    : null;

  const streakAtRisk =
    user.dailyStreak > 0 && !hasActivityToday && streakExpiresAt !== null;

  const level = user.level ?? 1;
  const totalXp = user.totalXp ?? 0;
  const xpForNextLevel = getXpRequiredForLevelUp(level);
  const levelStartXp = getTotalXpForLevelStart(level);
  const xpInLevel = totalXp - levelStartXp;
  const xpToNextLevel = xpForNextLevel - xpInLevel;
  const currentLevelProgress = Math.min(
    100,
    Math.round((xpInLevel / xpForNextLevel) * 100),
  );

  const QUIZ_QUESTIONS_PER_SESSION = 5;
  const QUIZ_XP_PER_QUESTION = 25;
  const WORKOUT_SETS_PER_SESSION = 6;
  const WORKOUT_XP_PER_SET = 15;

  const quizXpEstimate = QUIZ_QUESTIONS_PER_SESSION * QUIZ_XP_PER_QUESTION;
  const workoutXpEstimate = WORKOUT_SETS_PER_SESSION * WORKOUT_XP_PER_SET;

  const fastestXpAction =
    quizXpEstimate >= workoutXpEstimate ? "quiz" : "workout";

  return {
    dailyStreak: user.dailyStreak ?? 0,
    longestStreak: user.longestStreak ?? 0,
    streakExpiresAt: streakExpiresAt ? streakExpiresAt.toISOString() : null,
    streakAtRisk,
    hasActivityToday,
    level,
    totalXp,
    xpToNextLevel,
    xpForNextLevel,
    currentLevelProgress,
    fastestXpAction,
  };
};

module.exports = { getGamificationStatus };
