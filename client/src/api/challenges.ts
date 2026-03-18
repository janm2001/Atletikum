import type {
    WeeklyChallenge,
    WeeklyChallengesResponse,
    ClaimRewardData,
    ClaimRewardResponse,
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
