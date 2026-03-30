const { User } = require("../models/User");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { checkAndUnlockAchievements } = require("../utils/achievementChecker");
const { updateDailyStreak } = require("../utils/updateDailyStreak");
const { attachSession, saveWithSession } = require("../utils/mongoTransaction");
const { requireUserId } = require("../utils/userIdentity");
const { recordXpEvent } = require("./xpLedgerService");
const { createActivityEvent } = require("./activityService");

const loadUser = (userId, session) =>
  attachSession(User.findById(userId), session);

const applyExperienceGain = async ({ user, brainXp, bodyXp, session }) => {
  if (!user || (brainXp === 0 && bodyXp === 0)) {
    return user;
  }

  const previousLevel = user.level;

  user.brainXp += brainXp;
  user.bodyXp += bodyXp;
  user.totalXp = user.brainXp + user.bodyXp;
  user.level = getLevelFromTotalXp(user.totalXp);

  await saveWithSession(user, session);

  if (user.level > previousLevel) {
    createActivityEvent({
      userId: user._id,
      type: "level_up",
      data: { level: user.level, totalXp: user.totalXp },
    }).catch(() => {});
  }

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
    const prevStreak = user.dailyStreak ?? 0;
    user =
      (await updateDailyStreak(normalizedUserId, { session })) ??
      user;

    const newStreak = user.dailyStreak ?? 0;
    const STREAK_MILESTONES = [7, 30, 100];
    if (
      newStreak > prevStreak &&
      STREAK_MILESTONES.includes(newStreak)
    ) {
      createActivityEvent({
        userId: normalizedUserId,
        type: "streak_milestone",
        data: { streak: newStreak },
      }).catch(() => {});
    }
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
