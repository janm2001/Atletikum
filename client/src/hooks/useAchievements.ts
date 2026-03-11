import { useQuery } from "@tanstack/react-query";
import { getAchievements } from "@/api/achievements";
import { keys } from "../lib/query-keys";
import type { Achievement } from "../types/Achievement/achievement";

export type { Achievement };

export const useAchievements = () => {
    return useQuery<Achievement[]>({
        queryKey: keys.achievements.all,
        queryFn: getAchievements,
    });
};
