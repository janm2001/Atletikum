const XP_BASE_PER_LEVEL = 200;
const XP_GROWTH_PER_LEVEL = 50;

const getXpRequiredForLevelUp = (level) => {
  const safeLevel = Math.max(1, Number(level) || 1);
  return XP_BASE_PER_LEVEL + (safeLevel - 1) * XP_GROWTH_PER_LEVEL;
};

const getTotalXpForLevelStart = (level) => {
  const safeLevel = Math.max(1, Number(level) || 1);

  if (safeLevel <= 1) {
    return 0;
  }

  const levelsBefore = safeLevel - 1;
  return (
    (levelsBefore *
      (2 * XP_BASE_PER_LEVEL + (levelsBefore - 1) * XP_GROWTH_PER_LEVEL)) /
    2
  );
};

const getLevelFromTotalXp = (totalXp) => {
  let level = 1;
  let remainingXp = Math.max(0, Number(totalXp) || 0);

  while (remainingXp >= getXpRequiredForLevelUp(level)) {
    remainingXp -= getXpRequiredForLevelUp(level);
    level += 1;
  }

  return level;
};

module.exports = {
  XP_BASE_PER_LEVEL,
  XP_GROWTH_PER_LEVEL,
  getXpRequiredForLevelUp,
  getTotalXpForLevelStart,
  getLevelFromTotalXp,
};
