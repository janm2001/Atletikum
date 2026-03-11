import { z } from "zod";

export const workoutMetricTypeSchema = z.enum(["reps", "distance", "time"]);

export const completedExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Vježba je obavezna"),
  metricType: workoutMetricTypeSchema.optional(),
  unitLabel: z.string().min(1, "Jedinica je obavezna").optional(),
  resultValue: z
    .number({ error: "Rezultat seta mora biti broj" })
    .min(1, "Rezultat seta mora biti najmanje 1"),
  loadKg: z
    .number({ error: "Težina mora biti broj" })
    .min(0, "Težina ne može biti negativna")
    .nullable()
    .optional(),
  rpe: z
    .number({ error: "RPE mora biti broj" })
    .min(1, "RPE mora biti najmanje 1")
    .max(10, "RPE može biti najviše 10"),
  isPersonalBest: z.boolean().optional(),
});

export const workoutLogSchema = z.object({
  workoutId: z.string().min(1, "Trening je obavezan"),
  completedExercises: z
    .array(completedExerciseSchema)
    .min(1, "Potrebno je unijeti barem jedan odrađeni set"),
});

export type WorkoutLogFormValues = z.input<typeof workoutLogSchema>;