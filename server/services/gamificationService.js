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

  const quizXpEstimate = 5 * 25;
  const workoutXpEstimate = 6 * 15;

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
