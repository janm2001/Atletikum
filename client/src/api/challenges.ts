import type { WeeklyChallenge, WeeklyChallengesResponse } from "@/types/Challenge/challenge";
import { apiClient } from "@/utils/apiService";

export async function getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const { data } = await apiClient.get<WeeklyChallengesResponse>(
        "/challenges/weekly",
    );
    return data.data.challenges;
}
