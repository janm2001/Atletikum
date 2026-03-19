import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    type CreateWorkoutLogParams,
    createWorkoutLog,
    getLatestWorkoutLog,
    getWorkoutLogs,
} from "@/api/workoutLogs";
import { prependCachedEntity } from "@/lib/query-cache";
import { keys } from "@/lib/query-keys";
import type {
    WorkoutLog,
    WorkoutLogPayload,
    CreateWorkoutLogResult,
} from "@/types/WorkoutLog/workoutLog";

export type { WorkoutLog, WorkoutLogPayload, CreateWorkoutLogResult };

export function useWorkoutLogs() {
    return useQuery<WorkoutLog[], Error>({
        queryKey: keys.workoutLogs.list(),
        queryFn: getWorkoutLogs,
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
            queryClient.setQueryData<WorkoutLog[] | undefined>(
                keys.workoutLogs.list(),
                (workoutLogs) => prependCachedEntity(workoutLogs, workoutLog),
            );
            queryClient.invalidateQueries({
                queryKey: keys.challenges.weekly(),
            });
            queryClient.invalidateQueries({
                queryKey: keys.workoutLogs.latest(workoutLog.workoutId),
            });
        },
    });
}
