import type { Exercise } from "@/types/Exercise/exercise";
import type {
    ExercisePayload,
    ExerciseResponse,
    ExercisesResponse,
} from "@/types/Exercise/exerciseApi";
import { apiClient } from "@/utils/apiService";

export async function getExercises(): Promise<Exercise[]> {
    const { data } = await apiClient.get<ExercisesResponse>("/exercises");
    return data.data.exercises;
}

export async function getExerciseDetail(id: string): Promise<Exercise> {
    const { data } = await apiClient.get<ExerciseResponse>(`/exercises/${id}`);
    return data.data.exercise;
}

export async function createExercise(
    payload: ExercisePayload,
): Promise<Exercise> {
    const { data } = await apiClient.post<ExerciseResponse>("/exercises", payload);
    return data.data.exercise;
}

export async function updateExercise({
    id,
    payload,
}: {
    id: string;
    payload: ExercisePayload;
}): Promise<Exercise> {
    const { data } = await apiClient.patch<ExerciseResponse>(
        `/exercises/${id}`,
        payload,
    );
    return data.data.exercise;
}

export async function deleteExercise(id: string): Promise<void> {
    await apiClient.delete(`/exercises/${id}`);
}