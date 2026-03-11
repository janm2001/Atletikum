import { z } from "zod";

const progressionSchema = z
  .object({
    enabled: z.boolean(),
    initialWeightKg: z
      .number()
      .min(0, "Početna težina ne može biti negativna")
      .nullable(),
    incrementKg: z.number().min(0, "Korak progresije ne može biti negativan"),
  })
  .superRefine((value, context) => {
    if (!value.enabled) {
      return;
    }

    if (value.initialWeightKg === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Početna težina je obavezna za progresivnu vježbu",
        path: ["initialWeightKg"],
      });
    }
  });

const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Vježba mora biti odabrana"),
  sets: z.number().min(1, "Minimalno 1 serija"),
  reps: z.string().min(1, "Ponavljanja su obavezna"),
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
      message: "Progressivna vježba mora imati točan broj ponavljanja",
      path: ["reps"],
    });
  }
});

export const workoutSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  description: z.string(),
  requiredLevel: z.number().min(1, "Minimalna razina je 1"),
  tags: z.array(z.string()).optional(),
  exercises: z.array(workoutExerciseSchema),
});

export type WorkoutFormValues = z.input<typeof workoutSchema>;
export type WorkoutExerciseInput = z.input<typeof workoutExerciseSchema>;
