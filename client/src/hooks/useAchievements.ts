import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/apiService";

export interface Achievement {
    _id: string;
    key: string;
    title: string;
    description: string;
    xpReward: number;
    xpCategory: "brain" | "body" | "both";
    category: "milestone" | "consistency" | "performance" | "special";
    trigger: string;
    threshold: number;
    badgeIcon: string;
    isUnlocked: boolean;
    unlockedAt: string | null;
}

interface AchievementsResponse {
    status: string;
    results: number;
    data: {
        achievements: Achievement[];
    };
}

export const useAchievements = () => {
    return useQuery<Achievement[]>({
        queryKey: ["achievements"],
        queryFn: async () => {
            const { data } =
                await apiClient.get<AchievementsResponse>("/achievements");
            return data.data.achievements;
        },
    });
};
