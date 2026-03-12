import { z } from "zod";
import i18next from "i18next";
import { MuscleGroup } from "../enums/muscleGroup";

const t = (key: string) => i18next.t(key);

const optionalUrlSchema = z
    .string()
    .trim()
    .url({ message: t("validation.exercise.urlInvalid") })
    .or(z.literal(""));

export const exerciseSchema = z.object({
    title: z.string().trim().min(1, t("validation.exercise.titleRequired")),
    description: z.string().trim().min(1, t("validation.exercise.descriptionRequired")),
    muscleGroup: z.nativeEnum(MuscleGroup),
    level: z.number().min(1, t("validation.exercise.levelMin")).max(100, t("validation.exercise.levelMax")),
    imageLink: optionalUrlSchema,
    videoLink: optionalUrlSchema,
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
