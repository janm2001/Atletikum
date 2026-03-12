import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createWorkoutLog,
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

export function useCreateWorkoutLog() {
    const queryClient = useQueryClient();

    return useMutation<CreateWorkoutLogResult, Error, WorkoutLogPayload>({
        mutationFn: createWorkoutLog,
        onSuccess: ({ workoutLog }) => {
            queryClient.setQueryData<WorkoutLog[] | undefined>(
                keys.workoutLogs.list(),
                (workoutLogs) => prependCachedEntity(workoutLogs, workoutLog),
            );
        },
    });
}
