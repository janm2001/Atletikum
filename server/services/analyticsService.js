const { User } = require("../models/User");
const { QuizCompletion } = require("../models/QuizCompletion");

const STREAK_BUCKETS = [
  { label: "0", min: 0, max: 0 },
  { label: "1-3", min: 1, max: 3 },
  { label: "4-7", min: 4, max: 7 },
  { label: "8-14", min: 8, max: 14 },
  { label: "15+", min: 15, max: Infinity },
];

const ACHIEVEMENT_THRESHOLDS = [1, 5, 10, 20];

const assignStreakBucket = (streak) => {
  for (const bucket of STREAK_BUCKETS) {
    if (streak >= bucket.min && streak <= bucket.max) {
      return bucket.label;
    }
  }
  return "0";
};

const getStreakSurvival = async () => {
  const users = await User.find({}, { dailyStreak: 1 }).lean();

  const distribution = {};
  for (const bucket of STREAK_BUCKETS) {
    distribution[bucket.label] = 0;
  }

  for (const user of users) {
    const label = assignStreakBucket(user.dailyStreak ?? 0);
    distribution[label] += 1;
  }

  return distribution;
};

const getQuizPassRate = async () => {
  const [totalResult, passedResult] = await Promise.all([
    QuizCompletion.countDocuments({}),
    QuizCompletion.countDocuments({ passed: true }),
  ]);

  return {
    total: totalResult,
    passed: passedResult,
    rate: totalResult > 0 ? passedResult / totalResult : 0,
  };
};

const getAchievementUnlockRates = async () => {
  const totalUsers = await User.countDocuments({});

  const rates = {};
  for (const threshold of ACHIEVEMENT_THRESHOLDS) {
    const count = await User.countDocuments({
      [`achievements.${threshold - 1}`]: { $exists: true },
    });

    rates[`${threshold}+`] = {
      count,
      totalUsers,
      rate: totalUsers > 0 ? count / totalUsers : 0,
    };
  }

  return rates;
};

const getWeeklyActiveByLevel = async () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const results = await User.aggregate([
    { $match: { lastActivityDate: { $gte: oneWeekAgo } } },
    {
      $group: {
        _id: "$level",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byLevel = {};
  for (const row of results) {
    byLevel[row._id] = row.count;
  }

  return byLevel;
};

const getGamificationKpis = async () => {
  const [streakSurvival, quizPassRate, achievementUnlockRates, weeklyActiveByLevel] =
    await Promise.all([
      getStreakSurvival(),
      getQuizPassRate(),
      getAchievementUnlockRates(),
      getWeeklyActiveByLevel(),
    ]);

  return {
    streakSurvival,
    quizPassRate,
    achievementUnlockRates,
    weeklyActiveByLevel,
  };
};

module.exports = {
  STREAK_BUCKETS,
  ACHIEVEMENT_THRESHOLDS,
  getGamificationKpis,
};
