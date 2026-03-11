import type { LeaderboardUser } from "@/types/Leaderboard/leaderboard";
import type { User } from "@/types/User/user";

export type LeaderboardData = {
    leaderboard: LeaderboardUser[];
    myRank: number;
    me: User;
};

export type LeaderboardResponse = {
    status: string;
    data: LeaderboardData;
};