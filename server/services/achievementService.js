const { Achievement } = require("../models/Achievement");
const { User } = require("../models/User");
const { WorkoutLog } = require("../models/WorkoutLog");
const { QuizCompletion } = require("../models/QuizCompletion");

const getUserCurrentValue = (trigger, { user, workoutCount, quizCount }) => {
  switch (trigger) {
    case "workout_count":
      return workoutCount;
    case "quiz_count":
      return quizCount;
    case "xp_threshold":
      return user.totalXp;
    case "streak":
      return user.dailyStreak;
    case "level":
      return user.level;
    case "perfect_quiz":
      return 0;
    case "same_day_both":
      return 0;
    default:
      return 0;
  }
};

const getMyAchievements = async ({ userId }) => {
  const allAchievements = await Achievement.find().lean();
  const user = await User.findById(userId).lean();

  const unlockedMap = new Map(
    (user?.achievements || []).map((achievement) => [
      achievement.achievement.toString(),
      achievement.unlockedAt,
    ]),
  );

  const hasLockedCountable = allAchievements.some(
    (a) =>
      !unlockedMap.has(a._id.toString()) &&
      ["workout_count", "quiz_count"].includes(a.trigger),
  );

  let workoutCount = 0;
  let quizCount = 0;

  if (hasLockedCountable && user) {
    const needsWorkout = allAchievements.some(
      (a) =>
        !unlockedMap.has(a._id.toString()) && a.trigger === "workout_count",
    );
    const needsQuiz = allAchievements.some(
      (a) => !unlockedMap.has(a._id.toString()) && a.trigger === "quiz_count",
    );

    const [wc, qc] = await Promise.all([
      needsWorkout
        ? WorkoutLog.countDocuments({ user: userId })
        : Promise.resolve(0),
      needsQuiz
        ? QuizCompletion.countDocuments({ user: userId })
        : Promise.resolve(0),
    ]);
    workoutCount = wc;
    quizCount = qc;
  }

  return allAchievements.map((achievement) => {
    const isUnlocked = unlockedMap.has(achievement._id.toString());
    const base = {
      ...achievement,
      isUnlocked,
      unlockedAt: unlockedMap.get(achievement._id.toString()) || null,
    };

    if (isUnlocked || !user) {
      return { ...base, progress: null };
    }

    const current = getUserCurrentValue(achievement.trigger, {
      user,
      workoutCount,
      quizCount,
    });
    const required = achievement.threshold;
    const progressPercent = Math.min(
      100,
      Math.round((current / required) * 100),
    );

    return {
      ...base,
      progress: { current, required, progressPercent },
    };
  });
};

module.exports = {
  getMyAchievements,
};
