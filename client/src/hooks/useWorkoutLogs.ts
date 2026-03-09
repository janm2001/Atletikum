import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/utils/apiService";
import type { User } from "@/types/User/user";

import type { NewAchievement } from "@/hooks/useQuiz";

type CompletedExercisePayload = {
    exerciseId: string;
    weight: number;
    reps: number;
    rpe: number;
};

export type WorkoutLogPayload = {
    workout?: string;
    requiredLevel?: number;
    completedExercises: CompletedExercisePayload[];
    date?: string;
};

export type WorkoutLog = WorkoutLogPayload & {
    _id: string;
    user: string;
    totalXpGained?: number;
};

type WorkoutLogsResponse = {
    status: string;
    results: number;
    data: {
        workoutLogs: WorkoutLog[];
    };
};

type WorkoutLogResponse = {
    status: string;
    data: {
        workoutLog: WorkoutLog;
        user: User | null;
        newAchievements: NewAchievement[];
        totalXpGained: number;
    };
};

export type CreateWorkoutLogResult = {
    workoutLog: WorkoutLog;
    user: User | null;
    newAchievements: NewAchievement[];
    totalXpGained: number;
};

const WORKOUT_LOGS_QUERY_KEY = ["workout-logs"] as const;

export function useWorkoutLogs() {
    return useQuery<WorkoutLog[], Error>({
        queryKey: WORKOUT_LOGS_QUERY_KEY,
        queryFn: async () => {
            const { data } = await apiClient.get<WorkoutLogsResponse>("/workout-logs");
            return data.data.workoutLogs;
        },
    });
}

export function useCreateWorkoutLog() {
    const queryClient = useQueryClient();

    return useMutation<CreateWorkoutLogResult, Error, WorkoutLogPayload>({
        mutationFn: async (payload) => {
            const { data } = await apiClient.post<WorkoutLogResponse>(
                "/workout-logs",
                payload
            );
            return {
                workoutLog: data.data.workoutLog,
                user: data.data.user,
                newAchievements: data.data.newAchievements,
                totalXpGained: data.data.totalXpGained,
            };
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: WORKOUT_LOGS_QUERY_KEY });
        },
    });
}
