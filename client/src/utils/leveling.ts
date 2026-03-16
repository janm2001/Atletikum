export const XP_BASE_PER_LEVEL = 200;
export const XP_GROWTH_PER_LEVEL = 50;

export const getXpRequiredForLevelUp = (level: number): number => {
    const safeLevel = Math.max(1, Number(level) || 1);
    return XP_BASE_PER_LEVEL + (safeLevel - 1) * XP_GROWTH_PER_LEVEL;
};

export const getTotalXpForLevelStart = (level: number): number => {
    const safeLevel = Math.max(1, Number(level) || 1);

    if (safeLevel <= 1) {
        return 0;
    }

    const levelsBefore = safeLevel - 1;
    return (
        (levelsBefore * (2 * XP_BASE_PER_LEVEL + (levelsBefore - 1) * XP_GROWTH_PER_LEVEL)) /
        2
    );
};

export const getXpProgress = (level: number, totalXp: number) => {
    const xpForNext = getXpRequiredForLevelUp(level);
    const levelStart = getTotalXpForLevelStart(level);
    const xpInLevel = totalXp - levelStart;
    const remaining = xpForNext - xpInLevel;
    const percent = Math.min(100, Math.round((xpInLevel / xpForNext) * 100));
    return { xpInLevel, xpForNext, remaining, percent };
};

export const getLevelFromTotalXp = (totalXp: number): number => {
    let level = 1;
    let remainingXp = Math.max(0, Number(totalXp) || 0);

    while (remainingXp >= getXpRequiredForLevelUp(level)) {
        remainingXp -= getXpRequiredForLevelUp(level);
        level += 1;
    }

    return level;
};
