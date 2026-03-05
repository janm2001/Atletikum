type PopulatedExercise = {
    _id: string;
    title: string;
    imageLink?: string;
}

type WorkoutExercise = {
    exerciseId: string | PopulatedExercise;
    sets: number;
    reps: string;
    rpe: string;
    baseXp: number;
}

export type Workout = {
    _id: string;
    title: string;
    description: string;
    requiredLevel: number;
    exercises: WorkoutExercise[];
}

export function getExerciseName(exerciseId: string | PopulatedExercise | null): string | undefined {
    return exerciseId != null && typeof exerciseId === 'object' ? exerciseId.title : undefined;
}

export function getExerciseImage(exerciseId: string | PopulatedExercise | null): string | undefined {
    return exerciseId != null && typeof exerciseId === 'object' ? exerciseId.imageLink : undefined;
}

export function getExerciseId(exerciseId: string | PopulatedExercise | null): string {
    if (exerciseId == null) return '';
    return typeof exerciseId === 'object' ? exerciseId._id : exerciseId;
}