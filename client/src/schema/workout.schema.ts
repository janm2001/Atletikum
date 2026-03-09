import { z } from "zod";

const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Vježba mora biti odabrana"),
  sets: z.number().min(1, "Minimalno 1 serija"),
  reps: z.string().min(1, "Ponavljanja su obavezna"),
  rpe: z.string(),
  baseXp: z.number().min(0, "XP ne može biti negativan"),
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
