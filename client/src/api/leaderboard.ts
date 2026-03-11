import type {
    LeaderboardData,
    LeaderboardResponse,
} from "@/types/Leaderboard/leaderboardApi";
import { apiClient } from "@/utils/apiService";

export async function getLeaderboard(): Promise<LeaderboardData> {
    const { data } = await apiClient.get<LeaderboardResponse>("/leaderboard");
    return data.data;
}