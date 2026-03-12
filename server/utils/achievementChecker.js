const { Achievement } = require("../models/Achievement");
const { User } = require("../models/User");
const { WorkoutLog } = require("../models/WorkoutLog");
const { QuizCompletion } = require("../models/QuizCompletion");
const { getLevelFromTotalXp } = require("./leveling");
const { requireUserId } = require("./userIdentity");

const checkAndUnlockAchievements = async (userId) => {
  const normalizedUserId = requireUserId({ userId });
  const user = await User.findById(normalizedUserId);
  if (!user) return [];

  const allAchievements = await Achievement.find();
  const unlockedIds = new Set(
    user.achievements.map((a) => a.achievement.toString()),
  );

  const [workoutCount, quizCount, quizCompletions] = await Promise.all([
    WorkoutLog.countDocuments({ user: normalizedUserId }),
    QuizCompletion.countDocuments({ user: normalizedUserId }),
    QuizCompletion.find({ user: normalizedUserId })
      .sort({ completedAt: -1 })
      .limit(50)
      .lean(),
  ]);

  const hasPerfectQuiz = quizCompletions.some(
    (qc) => qc.score === qc.totalQuestions && qc.totalQuestions > 0,
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayWorkout, todayQuiz] = await Promise.all([
    WorkoutLog.exists({
      user: normalizedUserId,
      date: { $gte: today, $lt: tomorrow },
    }),
    QuizCompletion.exists({
      user: normalizedUserId,
      completedAt: { $gte: today, $lt: tomorrow },
    }),
  ]);
  const sameDayBoth = !!(todayWorkout && todayQuiz);

  const newlyUnlocked = [];

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement._id.toString())) continue;

    let earned = false;

    switch (achievement.trigger) {
      case "workout_count":
        earned = workoutCount >= achievement.threshold;
        break;
      case "quiz_count":
        earned = quizCount >= achievement.threshold;
        break;
      case "xp_threshold":
        earned = user.totalXp >= achievement.threshold;
        break;
      case "streak":
        earned = user.dailyStreak >= achievement.threshold;
        break;
      case "level":
        earned = user.level >= achievement.threshold;
        break;
      case "perfect_quiz":
        earned = hasPerfectQuiz && achievement.threshold <= 1;
        break;
      case "same_day_both":
        earned = sameDayBoth;
        break;
    }

    if (earned) {
      const xp = achievement.xpReward;
      if (achievement.xpCategory === "brain") {
        user.brainXp += xp;
      } else if (achievement.xpCategory === "body") {
        user.bodyXp += xp;
      } else {
        const half = Math.floor(xp / 2);
        user.brainXp += half;
        user.bodyXp += xp - half;
      }
      user.totalXp = user.brainXp + user.bodyXp;
      user.level = getLevelFromTotalXp(user.totalXp);

      user.achievements.push({
        achievement: achievement._id,
        unlockedAt: new Date(),
      });

      newlyUnlocked.push({
        _id: achievement._id,
        key: achievement.key,
        title: achievement.title,
        description: achievement.description,
        xpReward: achievement.xpReward,
        category: achievement.category,
        badgeIcon: achievement.badgeIcon,
      });
    }
  }

  if (newlyUnlocked.length > 0) {
    await user.save();
  }

  return newlyUnlocked;
};

module.exports = { checkAndUnlockAchievements };
