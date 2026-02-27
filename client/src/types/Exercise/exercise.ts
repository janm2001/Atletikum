import type { MuscleGroupValue } from "../../enums/muscleGroup";

export type Exercise = {
    _id: string;
    title: string;
    description: string;
    muscleGroup: MuscleGroupValue;
    videoLink?: string;
    imageLink?: string;
    level: number;
    createdAt?: string;
    updatedAt?: string;
};
