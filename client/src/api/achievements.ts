import type { Achievement } from "@/types/Achievement/achievement";
import type { AchievementsResponse } from "@/types/Achievement/achievementApi";
import { apiClient } from "@/utils/apiService";

export async function getAchievements(): Promise<Achievement[]> {
    const { data } = await apiClient.get<AchievementsResponse>("/achievements");
    return data.data.achievements;
}