import type {
    WeeklyChallenge,
    WeeklyChallengesResponse,
    ClaimRewardData,
    ClaimRewardResponse,
    ChallengeHistoryData,
    ChallengeHistoryResponse,
    WeeklyLeaderboardData,
    WeeklyLeaderboardResponse,
} from "@/types/Challenge/challenge";
import { apiClient } from "@/utils/apiService";

export async function getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const { data } = await apiClient.get<WeeklyChallengesResponse>(
        "/challenges/weekly",
    );
    return data.data.challenges;
}

export async function claimChallengeReward(
    challengeId: string,
): Promise<ClaimRewardData> {
    const { data } = await apiClient.post<ClaimRewardResponse>(
        `/challenges/weekly/${challengeId}/claim`,
    );
    return data.data;
}

export async function getChallengeHistory(params?: {
    limit?: number;
    cursorWeekStart?: string;
}): Promise<ChallengeHistoryData> {
    const { data } = await apiClient.get<ChallengeHistoryResponse>(
        "/challenges/history",
        { params },
    );
    return data.data;
}

export async function getWeeklyLeaderboard(params?: {
    weekStart?: string;
    limit?: number;
}): Promise<WeeklyLeaderboardData> {
    const { data } = await apiClient.get<WeeklyLeaderboardResponse>(
        "/challenges/leaderboard/weekly",
        { params },
    );
    return data.data;
}
