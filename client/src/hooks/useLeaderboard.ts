import { useQuery } from "@tanstack/react-query";
import { keys } from "../lib/query-keys";
import { apiClient } from "../utils/apiService";
import type { User } from "../types/User/user";
import type { LeaderboardUser } from "../types/Leaderboard/leaderboard";

export type { LeaderboardUser };

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
        queryKey: keys.leaderboard.all,
        queryFn: async () => {
            const { data } =
                await apiClient.get<LeaderboardResponse>("/leaderboard");
            return data.data;
        },
    });
};
