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
