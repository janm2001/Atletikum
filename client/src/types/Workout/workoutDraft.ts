import type { CompletedExercisePayload } from "@/types/WorkoutLog/workoutLog";

// Note: DraftSetValues is structurally identical to TrackWorkoutSetFormValues
// from @/types/Workout/trackWorkout. No mapping needed between them.
export interface DraftSetValues {
  loadKg: number | null;
  resultValue: number;
  rpe: number;
}

export interface WorkoutDraft {
  version: 1;
  workoutId: string;
  exerciseIndex: number;
  completedExercises: CompletedExercisePayload[];  // flat array, one entry per set
  currentSetValues: DraftSetValues[];               // form values for the active exercise
  idempotencyKey: string;        // UUID, generated on draft creation
  submitting: boolean;           // true while submission in flight
  startedAt: string;             // ISO timestamp
  lastSavedAt: string;           // ISO timestamp
}
