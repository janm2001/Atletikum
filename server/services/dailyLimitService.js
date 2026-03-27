const { WorkoutLog } = require("../models/WorkoutLog");
const { User } = require("../models/User");
const { startOfIsoWeek, getIsoWeekDay } = require("../utils/dateUtils");
const { attachSession } = require("../utils/mongoTransaction");

const DEFAULT_DAILY_LIMIT = 2;

const getDailyProgress = async ({ userId, session = null }) => {
  const user = await attachSession(
    User.findById(userId).select("dailyWorkoutLimit").lean(),
    session
  );

  const limit = user?.dailyWorkoutLimit ?? DEFAULT_DAILY_LIMIT;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const completedToday = await attachSession(
    WorkoutLog.countDocuments({
      user: userId,
      date: { $gte: todayStart, $lte: todayEnd },
    }),
    session
  );

  return {
    limit,
    completed: completedToday,
    remaining: Math.max(0, limit - completedToday),
    canTrain: completedToday < limit,
  };
};

const getNextAvailableDaySlot = async ({ userId, session = null }) => {
  const progress = await getDailyProgress({ userId, session });

  if (!progress.canTrain) {
    return null;
  }

  return progress.completed + 1;
};

const checkDailyLimitReached = async ({ userId, session = null }) => {
  const progress = await getDailyProgress({ userId, session });
  return !progress.canTrain;
};

const getWeeklyStats = async ({ userId }) => {
  const weekStart = startOfIsoWeek(new Date());

  const logs = await WorkoutLog.find({
    user: userId,
    date: { $gte: weekStart },
  })
    .select("date")
    .lean();

  const daysWithWorkouts = new Set(
    logs.map((log) => getIsoWeekDay(new Date(log.date)))
  );

  return {
    weekStart,
    completedDays: Array.from(daysWithWorkouts).sort((a, b) => a - b),
    totalSessions: logs.length,
  };
};

module.exports = {
  getDailyProgress,
  getNextAvailableDaySlot,
  checkDailyLimitReached,
  getWeeklyStats,
  DEFAULT_DAILY_LIMIT,
};
