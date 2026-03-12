const { getLevelFromTotalXp } = require("./leveling");

const getUnlockedAchievementIds = (userAchievements = []) =>
  new Set(
    userAchievements
      .map((entry) => entry?.achievement)
      .filter(Boolean)
      .map((achievementId) => achievementId.toString()),
  );

const filterPendingAchievements = (allAchievements = [], unlockedIds) =>
  allAchievements.filter(
    (achievement) => !unlockedIds.has(achievement._id.toString()),
  );

const getAchievementRequirements = (achievements = []) => {
  const triggers = new Set(achievements.map((achievement) => achievement.trigger));

  return {
    needsWorkoutCount: triggers.has("workout_count"),
    needsQuizCount: triggers.has("quiz_count"),
    needsPerfectQuiz: triggers.has("perfect_quiz"),
    needsSameDayBoth: triggers.has("same_day_both"),
  };
};

const hasPerfectQuizCompletion = (quizCompletions = []) =>
  quizCompletions.some(
    (completion) =>
      completion.score === completion.totalQuestions &&
      completion.totalQuestions > 0,
  );

const didEarnAchievement = (
  achievement,
  { user, workoutCount = 0, quizCount = 0, hasPerfectQuiz = false, sameDayBoth = false },
) => {
  switch (achievement.trigger) {
    case "workout_count":
      return workoutCount >= achievement.threshold;
    case "quiz_count":
      return quizCount >= achievement.threshold;
    case "xp_threshold":
      return user.totalXp >= achievement.threshold;
    case "streak":
      return user.dailyStreak >= achievement.threshold;
    case "level":
      return user.level >= achievement.threshold;
    case "perfect_quiz":
      return hasPerfectQuiz && achievement.threshold <= 1;
    case "same_day_both":
      return sameDayBoth;
    default:
      return false;
  }
};

const applyAchievementReward = (user, achievement) => {
  const xp = achievement.xpReward;

  if (!Array.isArray(user.achievements)) {
    user.achievements = [];
  }

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
};

const buildUnlockedAchievement = (achievement) => ({
  _id: achievement._id,
  key: achievement.key,
  title: achievement.title,
  description: achievement.description,
  xpReward: achievement.xpReward,
  category: achievement.category,
  badgeIcon: achievement.badgeIcon,
});

module.exports = {
  applyAchievementReward,
  buildUnlockedAchievement,
  didEarnAchievement,
  filterPendingAchievements,
  getAchievementRequirements,
  getUnlockedAchievementIds,
  hasPerfectQuizCompletion,
};
