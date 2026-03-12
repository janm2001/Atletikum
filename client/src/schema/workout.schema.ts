import { z } from "zod";
import i18next from "i18next";

const t = (key: string) => i18next.t(key);

const progressionSchema = z
  .object({
    enabled: z.boolean(),
    initialWeightKg: z
      .number()
      .min(0, t("validation.workout.initialWeightNegative"))
      .nullable(),
    incrementKg: z.number().min(0, t("validation.workout.progressionStepNegative")),
  })
  .superRefine((value, context) => {
    if (!value.enabled) {
      return;
    }

    if (value.initialWeightKg === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.workout.initialWeightRequired"),
        path: ["initialWeightKg"],
      });
    }
  });

const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, t("validation.workout.exerciseRequired")),
  sets: z.number().min(1, t("validation.workout.setsMin")),
  reps: z.string().min(1, t("validation.workout.repsRequired")),
  rpe: z.string(),
  baseXp: z.number().min(0, "XP ne može biti negativan"),
  progression: progressionSchema,
}).superRefine((value, context) => {
  if (!value.progression.enabled) {
    return;
  }

  if (!/^\d+$/.test(value.reps.trim())) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("validation.workout.progressionRepsExact"),
      path: ["reps"],
    });
  }
});

export const workoutSchema = z.object({
  title: z.string().min(1, t("validation.workout.titleRequired")),
  description: z.string(),
  requiredLevel: z.number().min(1, t("validation.workout.levelMin")),
  tags: z.array(z.string()).optional(),
  exercises: z.array(workoutExerciseSchema),
});

export type WorkoutFormValues = z.input<typeof workoutSchema>;
export type WorkoutExerciseInput = z.input<typeof workoutExerciseSchema>;
