import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWeeklyChallenges, claimChallengeReward } from "@/api/challenges";
import { keys } from "@/lib/query-keys";

export type { WeeklyChallenge, ClaimRewardData } from "@/types/Challenge/challenge";

export const useWeeklyChallenges = () => {
    return useQuery({
        queryKey: keys.challenges.weekly(),
        queryFn: getWeeklyChallenges,
        staleTime: 60_000,
    });
};

export const useClaimChallengeReward = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: claimChallengeReward,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.challenges.weekly() });
            queryClient.invalidateQueries({ queryKey: keys.gamification.status() });
        },
    });
};
