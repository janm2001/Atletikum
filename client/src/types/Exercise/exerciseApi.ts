import type { Exercise } from "@/types/Exercise/exercise";

export type ExercisePayload = {
    title: string;
    description: string;
    muscleGroup: Exercise["muscleGroup"];
    level: number;
    imageLink?: string;
    videoLink?: string;
};

export type ExercisesPayload = {
    exercises: Exercise[];
};

export type ExerciseDetailPayload = {
    exercise: Exercise;
};

export type ExercisesResponse = {
    status: string;
    results: number;
    data: ExercisesPayload;
};

export type ExerciseResponse = {
    status: string;
    data: ExerciseDetailPayload;
};