import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { keys } from '../lib/query-keys';
import { apiClient } from '../utils/apiService';
import { type Exercise } from '../types/Exercise/exercise';

type ExercisePayload = {
    title: string;
    description: string;
    muscleGroup: Exercise['muscleGroup'];
    level: number;
    imageLink?: string;
    videoLink?: string;
};

type ExercisesResponse = {
    status: string;
    results: number;
    data: {
        exercises: Exercise[];
    };
};

type ExerciseResponse = {
    status: string;
    data: {
        exercise: Exercise;
    };
};

export function useExercises() {
    return useQuery<Exercise[], Error>({
        queryKey: keys.exercises.list(),
        queryFn: async () => {
            const { data } = await apiClient.get<ExercisesResponse>('/exercises');
            return data.data.exercises;
        },
    });
}

export function useExerciseDetail(id: string) {
    return useQuery<Exercise, Error>({
        queryKey: keys.exercises.detail(id),
        queryFn: async () => {
            const { data } = await apiClient.get<ExerciseResponse>(`/exercises/${id}`);
            return data.data.exercise;
        },
        enabled: !!id,
    });
}

export function useCreateExercise() {
    const queryClient = useQueryClient();

    return useMutation<Exercise, Error, ExercisePayload>({
        mutationFn: async (payload) => {
            const { data } = await apiClient.post<ExerciseResponse>('/exercises', payload);
            return data.data.exercise;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: keys.exercises.all });
        },
    });
}

export function useUpdateExercise() {
    const queryClient = useQueryClient();

    return useMutation<Exercise, Error, { id: string; payload: ExercisePayload }>({
        mutationFn: async ({ id, payload }) => {
            const { data } = await apiClient.patch<ExerciseResponse>(`/exercises/${id}`, payload);
            return data.data.exercise;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: keys.exercises.all });
        },
    });
}

export function useDeleteExercise() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: async (id) => {
            await apiClient.delete(`/exercises/${id}`);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: keys.exercises.all });
        },
    });
}