import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWeeklyChallenges,
    claimChallengeReward,
    getChallengeHistory,
    getWeeklyLeaderboard,
} from "@/api/challenges";
import { keys } from "@/lib/query-keys";
import { useUser } from "@/hooks/useUser";

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
    const { user, updateUser } = useUser();

    return useMutation({
        mutationFn: claimChallengeReward,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: keys.challenges.weekly() });
            queryClient.invalidateQueries({ queryKey: keys.gamification.status() });
            queryClient.invalidateQueries({ queryKey: keys.leaderboard.all });
            if (user) {
                updateUser({
                    ...user,
                    totalXp: data.progress.totalXp,
                    level: data.progress.level,
                    brainXp: data.progress.brainXp,
                    bodyXp: data.progress.bodyXp,
                });
            }
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
