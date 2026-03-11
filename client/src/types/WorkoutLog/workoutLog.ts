import type { User } from "../User/user";
import type { NewAchievement } from "../Achievement/achievement";

export type WorkoutMetricType = "reps" | "distance" | "time";

export type CompletedExercisePayload = {
    exerciseId: string;
    metricType?: WorkoutMetricType;
    unitLabel?: string;
    resultValue: number;
    loadKg?: number | null;
    rpe: number;
    isPersonalBest?: boolean;
};

export type WorkoutLogPayload = {
    workoutId: string;
    completedExercises: CompletedExercisePayload[];
};

export type WorkoutLog = WorkoutLogPayload & {
    _id: string;
    user: string;
    workout: string;
    workoutId: string;
    requiredLevel?: number;
    totalXpGained?: number;
    date?: string;
};

export type CreateWorkoutLogResult = {
    workoutLog: WorkoutLog;
    user: User | null;
    newAchievements: NewAchievement[];
    totalXpGained: number;
    personalBests?: CompletedExercisePayload[];
};

export const getCompletedExerciseValue = (exercise: CompletedExercisePayload) =>
    Number(exercise.resultValue ?? 0);

export const getCompletedExerciseLoad = (exercise: CompletedExercisePayload) =>
    exercise.loadKg ?? null;

export const formatCompletedExerciseResult = (
    exercise: CompletedExercisePayload,
) => {
    const value = getCompletedExerciseValue(exercise);
    const unitLabel = exercise.unitLabel ?? "reps";
    const load = getCompletedExerciseLoad(exercise);
    const valueText = `${value} ${unitLabel}`;

    if (load !== null && load !== undefined) {
        return `${load} kg · ${valueText}`;
    }

    return valueText;
};
