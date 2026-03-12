const { User } = require("../models/User");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { checkAndUnlockAchievements } = require("../utils/achievementChecker");
const { updateDailyStreak } = require("../utils/updateDailyStreak");
const { requireUserId } = require("../utils/userIdentity");

const applyUserProgress = async ({
  userId,
  brainXp = 0,
  bodyXp = 0,
  shouldUpdateStreak = false,
  shouldUnlockAchievements = false,
}) => {
  const normalizedUserId = requireUserId({ userId });
  const user = await User.findById(normalizedUserId);

  if (user && (brainXp !== 0 || bodyXp !== 0)) {
    user.brainXp += brainXp;
    user.bodyXp += bodyXp;
    user.totalXp = user.brainXp + user.bodyXp;
    user.level = getLevelFromTotalXp(user.totalXp);
    await user.save();
  }

  if (shouldUpdateStreak) {
    await updateDailyStreak(normalizedUserId);
  }

  const newAchievements = shouldUnlockAchievements
    ? await checkAndUnlockAchievements(normalizedUserId)
    : [];

  const freshUser = await User.findById(normalizedUserId);

  return {
    user: sanitizeUser(freshUser),
    newAchievements,
  };
};

module.exports = {
  applyUserProgress,
};
