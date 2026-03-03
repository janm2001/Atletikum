type Exercise = {
    exerciseId: string;
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
    exercises: Exercise[];
}