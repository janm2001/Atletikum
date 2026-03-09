import type { User } from "../User/user";
import type { NewAchievement } from "../Achievement/achievement";

export type CompletedExercisePayload = {
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

export type CreateWorkoutLogResult = {
    workoutLog: WorkoutLog;
    user: User | null;
    newAchievements: NewAchievement[];
    totalXpGained: number;
};
