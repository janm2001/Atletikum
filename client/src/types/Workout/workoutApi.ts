import type { Workout } from "@/types/Workout/workout";

export type WorkoutsPayload = {
    workouts: Workout[];
};

export type WorkoutScope = "available" | "global" | "mine" | "all";

export type WorkoutsResponse = {
    status: string;
    results: number;
    data: WorkoutsPayload;
};