import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/apiService";
import type { User } from "../types/User/user";

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

interface LeaderboardResponse {
    status: string;
    data: {
        leaderboard: LeaderboardUser[];
        myRank: number;
        me: User;
    };
}

export const useLeaderboard = () => {
    return useQuery({
        queryKey: ["leaderboard"],
        queryFn: async () => {
            const { data } =
                await apiClient.get<LeaderboardResponse>("/leaderboard");
            return data.data;
        },
    });
};
