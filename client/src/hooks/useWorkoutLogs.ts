import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { apiClient } from "@/utils/apiService";
import type { User } from "@/types/User/user";
import type { NewAchievement } from "@/types/Achievement/achievement";
import type {
    WorkoutLog,
    WorkoutLogPayload,
    CreateWorkoutLogResult,
} from "@/types/WorkoutLog/workoutLog";
import { workoutLogSchema } from "@/schema/workoutLog.schema";

export type { WorkoutLog, WorkoutLogPayload, CreateWorkoutLogResult };

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
        personalBests?: WorkoutLogPayload["completedExercises"];
    };
};

export function useWorkoutLogs() {
    return useQuery<WorkoutLog[], Error>({
        queryKey: keys.workoutLogs.all,
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
            const parsedPayload = workoutLogSchema.safeParse(payload);

            if (!parsedPayload.success) {
                throw new Error(parsedPayload.error.issues[0]?.message || "Workout log nije valjan.");
            }

            const { data } = await apiClient.post<WorkoutLogResponse>(
                "/workout-logs",
                parsedPayload.data
            );
            return {
                workoutLog: data.data.workoutLog,
                user: data.data.user,
                newAchievements: data.data.newAchievements,
                totalXpGained: data.data.totalXpGained,
                personalBests: data.data.personalBests,
            };
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: keys.workoutLogs.all });
        },
    });
}
