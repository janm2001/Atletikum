import type { NewAchievement } from "@/types/Achievement/achievement";
import type { User } from "@/types/User/user";
import type {
    WorkoutLog,
    WorkoutLogPayload,
} from "@/types/WorkoutLog/workoutLog";

export type WorkoutLogsPayload = {
    workoutLogs: WorkoutLog[];
};

export type WorkoutLogPayloadData = {
    workoutLog: WorkoutLog;
    user: User | null;
    newAchievements: NewAchievement[];
    totalXpGained: number;
    personalBests?: WorkoutLogPayload["completedExercises"];
};

export type WorkoutLogsResponse = {
    status: string;
    results: number;
    data: WorkoutLogsPayload;
};

export type WorkoutLogResponse = {
    status: string;
    data: WorkoutLogPayloadData;
};

export type LatestWorkoutLogResponse = {
    status: string;
    data: {
        workoutLog: WorkoutLog;
    };
};
