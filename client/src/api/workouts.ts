import type { Workout } from "@/types/Workout/workout";
import type { WorkoutScope, WorkoutsResponse } from "@/types/Workout/workoutApi";
import { apiClient } from "@/utils/apiService";

export async function getWorkouts(
    scope: WorkoutScope = "available",
): Promise<Workout[]> {
    const { data } = await apiClient.get<WorkoutsResponse>("/workouts", {
        params: { scope },
    });
    return data.data.workouts;
}

export async function createWorkout(
    newWorkout: Partial<Workout>,
): Promise<Workout> {
    const { data } = await apiClient.post<Workout>("/workouts", newWorkout);
    return data;
}

export async function createCustomWorkout(
    newWorkout: Partial<Workout>,
): Promise<Workout> {
    const { data } = await apiClient.post<Workout>("/workouts/custom", newWorkout);
    return data;
}

export async function updateWorkout({
    id,
    updatedData,
}: {
    id: string;
    updatedData: Partial<Workout>;
}): Promise<Workout> {
    const { data } = await apiClient.patch<Workout>(`/workouts/${id}`, updatedData);
    return data;
}

export async function deleteWorkout(id: string): Promise<void> {
    await apiClient.delete(`/workouts/${id}`);
}