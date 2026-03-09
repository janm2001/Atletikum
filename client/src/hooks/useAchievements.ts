import { useQuery } from "@tanstack/react-query";
import { keys } from "../lib/query-keys";
import { apiClient } from "../utils/apiService";
import type { Achievement } from "../types/Achievement/achievement";

export type { Achievement };

interface AchievementsResponse {
    status: string;
    results: number;
    data: {
        achievements: Achievement[];
    };
}

export const useAchievements = () => {
    return useQuery<Achievement[]>({
        queryKey: keys.achievements.all,
        queryFn: async () => {
            const { data } =
                await apiClient.get<AchievementsResponse>("/achievements");
            return data.data.achievements;
        },
    });
};
