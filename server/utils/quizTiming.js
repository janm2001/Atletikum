const { addUtcDays } = require("./dateUtils");

const QUIZ_COOLDOWN_DAYS = 3;
const QUIZ_REVISION_ELIGIBILITY_DAYS = 7;

const COOLDOWN_SCHEDULE = {
  1: 3,
  2: 7,
  3: 14,
  4: 30,
};

const MASTERY_THRESHOLD = 0.6;

const getQuizCooldownEnd = (completedAt) => {
  return addUtcDays(completedAt, QUIZ_COOLDOWN_DAYS);
};

const getRevisionEligibilityCutoff = (now = new Date()) => {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - QUIZ_REVISION_ELIGIBILITY_DAYS);
  return cutoff;
};

const buildRevisionEligibilityFilter = ({ userId, now = new Date() }) => ({
  user: userId,
  completedAt: { $lte: getRevisionEligibilityCutoff(now) },
});

const selectRandomEligibleRevisionCompletion = (completions = []) => {
  if (completions.length === 0) {
    return null;
  }

  return completions[Math.floor(Math.random() * completions.length)];
};

const selectOldestEligibleRevisionCompletion = (completions = []) =>
  completions[0] ?? null;

const getCooldownDays = (level) => COOLDOWN_SCHEDULE[level] ?? 3;

const getNextCooldownLevel = (currentLevel, passed) => {
  if (passed) {
    return Math.min(4, currentLevel + 1);
  }
  if (currentLevel > 1) {
    return currentLevel - 1;
  }
  return 1;
};

const getXpMultiplier = (attemptNumber) => {
  if (attemptNumber === 1) return 1.0;
  if (attemptNumber <= 3) return 0.5;
  return 0.25;
};

module.exports = {
  COOLDOWN_SCHEDULE,
  MASTERY_THRESHOLD,
  QUIZ_COOLDOWN_DAYS,
  QUIZ_REVISION_ELIGIBILITY_DAYS,
  buildRevisionEligibilityFilter,
  getCooldownDays,
  getNextCooldownLevel,
  getQuizCooldownEnd,
  getRevisionEligibilityCutoff,
  getXpMultiplier,
  selectOldestEligibleRevisionCompletion,
  selectRandomEligibleRevisionCompletion,
};
