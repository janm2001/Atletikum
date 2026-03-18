import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWeeklyChallenges,
    claimChallengeReward,
    getChallengeHistory,
    getWeeklyLeaderboard,
} from "@/api/challenges";
import { keys } from "@/lib/query-keys";

export type {
    WeeklyChallenge,
    ClaimRewardData,
    ChallengeHistoryData,
    ChallengeHistoryWeek,
    WeeklyLeaderboardData,
    WeeklyLeaderboardUser,
} from "@/types/Challenge/challenge";

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

export const useChallengeHistory = (params?: {
    limit?: number;
    cursorWeekStart?: string;
}) => {
    return useQuery({
        queryKey: keys.challenges.history(params),
        queryFn: () => getChallengeHistory(params),
        staleTime: 60_000,
    });
};

export const useWeeklyLeaderboard = (params?: {
    weekStart?: string;
    limit?: number;
}) => {
    return useQuery({
        queryKey: keys.challenges.leaderboard(params),
        queryFn: () => getWeeklyLeaderboard(params),
        staleTime: 30_000,
    });
};
