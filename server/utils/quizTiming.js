const { addUtcDays } = require("./dateUtils");

const QUIZ_COOLDOWN_DAYS = 3;
const QUIZ_REVISION_ELIGIBILITY_DAYS = 7;

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

module.exports = {
  QUIZ_COOLDOWN_DAYS,
  QUIZ_REVISION_ELIGIBILITY_DAYS,
  buildRevisionEligibilityFilter,
  getQuizCooldownEnd,
  getRevisionEligibilityCutoff,
  selectOldestEligibleRevisionCompletion,
  selectRandomEligibleRevisionCompletion,
};
