import type { Achievement } from "@/types/Achievement/achievement";

export type AchievementsPayload = {
    achievements: Achievement[];
};

export type AchievementsResponse = {
    status: string;
    results: number;
    data: AchievementsPayload;
};