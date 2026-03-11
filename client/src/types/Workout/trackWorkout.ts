import type { WorkoutMetricType } from "@/types/WorkoutLog/workoutLog";

export type TrackWorkoutSetFormValues = {
    loadKg: number | null;
    resultValue: number;
    rpe: number;
};

export type TrackWorkoutFormValues = {
    sets: TrackWorkoutSetFormValues[];
};

export type TrackWorkoutMetric = {
    metricType: WorkoutMetricType;
    unitLabel: string;
    label: string;
};