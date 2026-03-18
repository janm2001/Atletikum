const { User } = require("../models/User");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { checkAndUnlockAchievements } = require("../utils/achievementChecker");
const { updateDailyStreak } = require("../utils/updateDailyStreak");
const { attachSession, saveWithSession } = require("../utils/mongoTransaction");
const { requireUserId } = require("../utils/userIdentity");
const { recordXpEvent } = require("./xpLedgerService");

const loadUser = (userId, session) =>
  attachSession(User.findById(userId), session);

const applyExperienceGain = async ({ user, brainXp, bodyXp, session }) => {
  if (!user || (brainXp === 0 && bodyXp === 0)) {
    return user;
  }

  user.brainXp += brainXp;
  user.bodyXp += bodyXp;
  user.totalXp = user.brainXp + user.bodyXp;
  user.level = getLevelFromTotalXp(user.totalXp);

  await saveWithSession(user, session);

  return user;
};

const recordXpLedgerEntries = async ({
  userId,
  brainXp,
  bodyXp,
  source,
  sourceEntityId,
  description,
  session,
}) => {
  const entries = [];

  if (brainXp > 0) {
    entries.push(
      recordXpEvent({
        userId,
        source,
        amount: brainXp,
        category: "brain",
        sourceEntityId,
        description,
        session,
      }),
    );
  }

  if (bodyXp > 0) {
    entries.push(
      recordXpEvent({
        userId,
        source,
        amount: bodyXp,
        category: "body",
        sourceEntityId,
        description,
        session,
      }),
    );
  }

  if (entries.length > 0) {
    await Promise.all(entries);
  }
};

const applyUserProgress = async ({
  userId,
  brainXp = 0,
  bodyXp = 0,
  shouldUpdateStreak = false,
  shouldUnlockAchievements = false,
  session = null,
  source = null,
  sourceEntityId = null,
  description = "",
}) => {
  const normalizedUserId = requireUserId({ userId });
  let user = await loadUser(normalizedUserId, session);

  user = await applyExperienceGain({
    user,
    brainXp,
    bodyXp,
    session,
  });

  if (source && (brainXp > 0 || bodyXp > 0)) {
    await recordXpLedgerEntries({
      userId: normalizedUserId,
      brainXp,
      bodyXp,
      source,
      sourceEntityId,
      description,
      session,
    });
  }

  if (shouldUpdateStreak) {
    user =
      (await updateDailyStreak(normalizedUserId, { session })) ??
      user;
  }

  const newAchievements = shouldUnlockAchievements
    ? await checkAndUnlockAchievements(normalizedUserId, { session, user })
    : [];

  return {
    user: sanitizeUser(user),
    newAchievements,
  };
};

module.exports = {
  applyUserProgress,
};
