import { useQuery } from "@tanstack/react-query";
import { getWeeklyChallenges } from "@/api/challenges";
import { keys } from "@/lib/query-keys";

export type { WeeklyChallenge } from "@/types/Challenge/challenge";

export const useWeeklyChallenges = () => {
    return useQuery({
        queryKey: keys.challenges.weekly(),
        queryFn: getWeeklyChallenges,
        staleTime: 60_000,
    });
};
