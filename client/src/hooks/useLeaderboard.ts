import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/api/leaderboard";
import { keys } from "../lib/query-keys";
import type { LeaderboardUser } from "../types/Leaderboard/leaderboard";

export type { LeaderboardUser };

export const useLeaderboard = () => {
    return useQuery({
        queryKey: keys.leaderboard.all,
        queryFn: getLeaderboard,
    });
};
