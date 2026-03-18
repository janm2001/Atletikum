export interface AchievementProgress {
    current: number;
    required: number;
    progressPercent: number;
}

export interface Achievement {
    _id: string;
    key: string;
    title: string;
    description: string;
    xpReward: number;
    xpCategory: "brain" | "body" | "both";
    category: "milestone" | "consistency" | "performance" | "special";
    trigger: string;
    threshold: number;
    badgeIcon: string;
    isUnlocked: boolean;
    unlockedAt: string | null;
    progress: AchievementProgress | null;
}

export interface NewAchievement {
    _id: string;
    key: string;
    title: string;
    description: string;
    xpReward: number;
    category: string;
    badgeIcon: string;
}
