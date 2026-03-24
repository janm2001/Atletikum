import { workoutLogSchema } from "@/schema/workoutLog.schema";
import type {
    CreateWorkoutLogResult,
    WorkoutLog,
    WorkoutLogPayload,
} from "@/types/WorkoutLog/workoutLog";
import type {
    LatestWorkoutLogResponse,
    WorkoutLogResponse,
    WorkoutLogsResponse,
} from "@/types/WorkoutLog/workoutLogApi";
import { apiClient } from "@/utils/apiService";

export type GetWorkoutLogsParams = {
    page?: number;
    limit?: number;
};

export type PaginatedWorkoutLogs = {
    logs: WorkoutLog[];
    total: number;
    page: number;
    totalPages: number;
};

export async function getWorkoutLogs(params: GetWorkoutLogsParams = {}): Promise<PaginatedWorkoutLogs> {
    const { data } = await apiClient.get<WorkoutLogsResponse>("/workout-logs", { params });
    return data.data;
}

export type CreateWorkoutLogParams = {
    payload: WorkoutLogPayload;
    idempotencyKey?: string;
};

export async function getLatestWorkoutLog(
    workoutId: string,
): Promise<WorkoutLog | null> {
    const { data, status } = await apiClient.get<LatestWorkoutLogResponse>(
        `/workout-logs/latest/${workoutId}`,
        {
            validateStatus: (s) => s === 200 || s === 204,
        },
    );

    if (status === 204) return null;
    return data.data.workoutLog;
}

export async function createWorkoutLog({
    payload,
    idempotencyKey,
}: CreateWorkoutLogParams): Promise<CreateWorkoutLogResult> {
    const parsedPayload = workoutLogSchema.safeParse(payload);

    if (!parsedPayload.success) {
        throw new Error(
            parsedPayload.error.issues[0]?.message || "Workout log is invalid.",
        );
    }

    const headers: Record<string, string> = {};
    if (idempotencyKey) {
        headers["X-Idempotency-Key"] = idempotencyKey;
    }

    const { data } = await apiClient.post<WorkoutLogResponse>(
        "/workout-logs",
        parsedPayload.data,
        { headers },
    );

    return {
        workoutLog: data.data.workoutLog,
        user: data.data.user,
        newAchievements: data.data.newAchievements,
        totalXpGained: data.data.totalXpGained,
        personalBests: data.data.personalBests,
    };
}
