import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createExercise,
    deleteExercise,
    getExerciseDetail,
    getExercises,
    updateExercise,
} from '@/api/exercises';
import { keys } from '../lib/query-keys';
import { type Exercise } from '../types/Exercise/exercise';
import type { ExercisePayload } from '@/types/Exercise/exerciseApi';

export function useExercises() {
    return useQuery<Exercise[], Error>({
        queryKey: keys.exercises.list(),
        queryFn: getExercises,
    });
}

export function useExerciseDetail(id: string) {
    return useQuery<Exercise, Error>({
        queryKey: keys.exercises.detail(id),
        queryFn: () => getExerciseDetail(id),
        enabled: !!id,
    });
}

export function useCreateExercise() {
    const queryClient = useQueryClient();

    return useMutation<Exercise, Error, ExercisePayload>({
        mutationFn: createExercise,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: keys.exercises.all });
        },
    });
}

export function useUpdateExercise() {
    const queryClient = useQueryClient();

    return useMutation<Exercise, Error, { id: string; payload: ExercisePayload }>({
        mutationFn: updateExercise,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: keys.exercises.all });
        },
    });
}

export function useDeleteExercise() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: deleteExercise,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: keys.exercises.all });
        },
    });
}