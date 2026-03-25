import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    type CreateWorkoutLogParams,
    type PaginatedWorkoutLogs,
    createWorkoutLog,
    getLatestWorkoutLog,
    getWorkoutLogs,
} from "@/api/workoutLogs";
import { keys } from "@/lib/query-keys";
import type {
    WorkoutLog,
    WorkoutLogPayload,
    CreateWorkoutLogResult,
} from "@/types/WorkoutLog/workoutLog";

export type { WorkoutLog, WorkoutLogPayload, CreateWorkoutLogResult };

export function useWorkoutLogs() {
    return useInfiniteQuery<PaginatedWorkoutLogs, Error>({
        queryKey: keys.workoutLogs.list(),
        queryFn: ({ pageParam }) => getWorkoutLogs({ page: pageParam as number }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    });
}

export function useLatestWorkoutLog(workoutId: string, enabled = true) {
    return useQuery<WorkoutLog | null, Error>({
        queryKey: keys.workoutLogs.latest(workoutId),
        queryFn: () => getLatestWorkoutLog(workoutId),
        enabled: Boolean(workoutId) && enabled,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateWorkoutLog() {
    const queryClient = useQueryClient();

    return useMutation<CreateWorkoutLogResult, Error, CreateWorkoutLogParams>({
        mutationFn: createWorkoutLog,
        onSuccess: ({ workoutLog }) => {
            queryClient.invalidateQueries({
                queryKey: keys.workoutLogs.list(),
            });
            queryClient.invalidateQueries({
                queryKey: keys.challenges.weekly(),
            });
            queryClient.invalidateQueries({
                queryKey: keys.workoutLogs.latest(workoutLog.workoutId),
            });
            queryClient.invalidateQueries({
                queryKey: keys.dailyProgress.current(),
            });
        },
    });
}
