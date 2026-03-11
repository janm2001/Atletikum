import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createWorkoutLog,
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
    return useQuery<WorkoutLog[], Error>({
        queryKey: keys.workoutLogs.all,
        queryFn: getWorkoutLogs,
    });
}

export function useCreateWorkoutLog() {
    const queryClient = useQueryClient();

    return useMutation<CreateWorkoutLogResult, Error, WorkoutLogPayload>({
        mutationFn: createWorkoutLog,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: keys.workoutLogs.all });
        },
    });
}
