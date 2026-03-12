const { User } = require("../models/User");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { checkAndUnlockAchievements } = require("../utils/achievementChecker");
const { updateDailyStreak } = require("../utils/updateDailyStreak");
const { attachSession, saveWithSession } = require("../utils/mongoTransaction");
const { requireUserId } = require("../utils/userIdentity");

const applyUserProgress = async ({
  userId,
  brainXp = 0,
  bodyXp = 0,
  shouldUpdateStreak = false,
  shouldUnlockAchievements = false,
  session = null,
}) => {
  const normalizedUserId = requireUserId({ userId });
  let user = await attachSession(User.findById(normalizedUserId), session);

  if (user && (brainXp !== 0 || bodyXp !== 0)) {
    user.brainXp += brainXp;
    user.bodyXp += bodyXp;
    user.totalXp = user.brainXp + user.bodyXp;
    user.level = getLevelFromTotalXp(user.totalXp);
    await saveWithSession(user, session);
  }

  if (shouldUpdateStreak) {
    user =
      (await updateDailyStreak(normalizedUserId, { session })) ??
      user;
  }

  const newAchievements = shouldUnlockAchievements
    ? await checkAndUnlockAchievements(normalizedUserId, { session, user })
    : [];

  const freshUser = await attachSession(User.findById(normalizedUserId), session);

  return {
    user: sanitizeUser(freshUser),
    newAchievements,
  };
};

module.exports = {
  applyUserProgress,
};
