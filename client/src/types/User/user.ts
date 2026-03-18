export type User = {
    _id: string;
    username: string;
    email?: string;
    trainingFrequency: number;
    focus: string;
    level: number;
    totalXp: number;
    brainXp: number;
    bodyXp: number;
    dailyStreak: number;
    longestStreak: number;
    role: string;
    profilePicture: string;
    achievements?: Array<{
        achievement: string;
        unlockedAt: string;
    }>;
}