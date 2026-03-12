import { z } from "zod";
import i18next from "i18next";

const t = (key: string) => i18next.t(key);

export const workoutMetricTypeSchema = z.enum(["reps", "distance", "time"]);

export const completedExerciseSchema = z.object({
  exerciseId: z.string().min(1, t("validation.workoutLog.exerciseRequired")),
  metricType: workoutMetricTypeSchema.optional(),
  unitLabel: z.string().min(1, t("validation.workoutLog.unitRequired")).optional(),
  resultValue: z
    .number({ error: t("validation.workoutLog.resultNumber") })
    .min(1, t("validation.workoutLog.resultMin")),
  loadKg: z
    .number({ error: t("validation.workoutLog.loadNumber") })
    .min(0, t("validation.workoutLog.loadNegative"))
    .nullable()
    .optional(),
  rpe: z
    .number({ error: t("validation.workoutLog.rpeNumber") })
    .min(1, t("validation.workoutLog.rpeMin"))
    .max(10, t("validation.workoutLog.rpeMax")),
  isPersonalBest: z.boolean().optional(),
});

export const workoutLogSchema = z.object({
  workoutId: z.string().min(1, t("validation.workoutLog.workoutRequired")),
  completedExercises: z
    .array(completedExerciseSchema)
    .min(1, t("validation.workoutLog.exercisesMin")),
});

export type WorkoutLogFormValues = z.input<typeof workoutLogSchema>;