type PopulatedExercise = {
  _id: string;
  title: string;
  imageLink?: string;
};

export type WorkoutExerciseProgression = {
  enabled: boolean;
  initialWeightKg: number | null;
  incrementKg: number;
  prescribedLoadKg?: number | null;
};

export type WorkoutExercise = {
  exerciseId: string | PopulatedExercise;
  sets: number;
  reps: string;
  rpe: string;
  baseXp: number;
  progression?: WorkoutExerciseProgression;
  restSeconds?: number | null;
};

export type Workout = {
  _id: string;
  title: string;
  description: string;
  requiredLevel: number;
  tags?: string[];
  createdBy?: string | null;
  exercises: WorkoutExercise[];
};

export function getExerciseName(
  exerciseId: string | PopulatedExercise | null,
): string | undefined {
  return exerciseId != null && typeof exerciseId === "object"
    ? exerciseId.title
    : undefined;
}

export function getExerciseImage(
  exerciseId: string | PopulatedExercise | null,
): string | undefined {
  return exerciseId != null && typeof exerciseId === "object"
    ? exerciseId.imageLink
    : undefined;
}

export function getExerciseId(
  exerciseId: string | PopulatedExercise | null,
): string {
  if (exerciseId == null) return "";
  return typeof exerciseId === "object" ? exerciseId._id : exerciseId;
}

export function isCustomWorkout(workout: Workout): boolean {
  return Boolean(workout.createdBy);
}

export function isWorkoutOwnedByUser(
  workout: Workout,
  userId: string | null | undefined,
): boolean {
  return Boolean(userId && workout.createdBy && workout.createdBy === userId);
}
