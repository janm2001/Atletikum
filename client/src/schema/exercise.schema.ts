import { z } from "zod";
import { MuscleGroup } from "../enums/muscleGroup";

const optionalUrlSchema = z
    .string()
    .trim()
    .url("Molimo unesite ispravan URL")
    .or(z.literal(""));

export const exerciseSchema = z.object({
    title: z.string().trim().min(1, "Naziv je obavezan"),
    description: z.string().trim().min(1, "Opis je obavezan"),
    muscleGroup: z.enum(Object.values(MuscleGroup) as [string, ...string[]]),
    level: z.number().min(1, "Razina mora biti najmanje 1").max(100, "Razina može biti najviše 100"),
    imageLink: optionalUrlSchema,
    videoLink: optionalUrlSchema,
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
