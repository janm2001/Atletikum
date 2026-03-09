export interface LeaderboardUser {
    _id: string;
    username: string;
    level: number;
    totalXp: number;
    brainXp: number;
    bodyXp: number;
    profilePicture: string;
    dailyStreak: number;
}
