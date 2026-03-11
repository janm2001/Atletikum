import { workoutLogSchema } from "@/schema/workoutLog.schema";
import type {
    CreateWorkoutLogResult,
    WorkoutLog,
    WorkoutLogPayload,
} from "@/types/WorkoutLog/workoutLog";
import type {
    WorkoutLogResponse,
    WorkoutLogsResponse,
} from "@/types/WorkoutLog/workoutLogApi";
import { apiClient } from "@/utils/apiService";

export async function getWorkoutLogs(): Promise<WorkoutLog[]> {
    const { data } = await apiClient.get<WorkoutLogsResponse>("/workout-logs");
    return data.data.workoutLogs;
}

export async function createWorkoutLog(
    payload: WorkoutLogPayload,
): Promise<CreateWorkoutLogResult> {
    const parsedPayload = workoutLogSchema.safeParse(payload);

    if (!parsedPayload.success) {
        throw new Error(
            parsedPayload.error.issues[0]?.message || "Workout log nije valjan.",
        );
    }

    const { data } = await apiClient.post<WorkoutLogResponse>(
        "/workout-logs",
        parsedPayload.data,
    );

    return {
        workoutLog: data.data.workoutLog,
        user: data.data.user,
        newAchievements: data.data.newAchievements,
        totalXpGained: data.data.totalXpGained,
        personalBests: data.data.personalBests,
    };
}