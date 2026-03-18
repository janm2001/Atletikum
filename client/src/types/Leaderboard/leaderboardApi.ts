import type { LeaderboardUser } from "@/types/Leaderboard/leaderboard";
import type { User } from "@/types/User/user";

export type NextRankUser = {
    username: string;
    totalXp: number;
};

export type LeaderboardData = {
    leaderboard: LeaderboardUser[];
    myRank: number;
    me: User;
    nextRankUser: NextRankUser | null;
    xpGapToNextRank: number | null;
};

export type LeaderboardResponse = {
    status: string;
    data: LeaderboardData;
};