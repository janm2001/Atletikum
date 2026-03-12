import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createWorkout,
    createCustomWorkout,
    deleteWorkout,
    getWorkouts,
    updateWorkout,
} from '@/api/workouts';
import {
    removeCachedEntity,
    replaceCachedEntity,
} from '@/lib/query-cache';
import { keys } from '../lib/query-keys';
import type { Workout } from '@/types/Workout/workout';
import type { WorkoutScope } from '@/types/Workout/workoutApi';

export function useWorkouts(scope: WorkoutScope = 'available') {
    return useQuery<Workout[], Error>({
        queryKey: keys.workouts.list(scope),
        queryFn: () => getWorkouts(scope),
    });
}

export function useCreateWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createWorkout,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: keys.workouts.lists(),
            });
        },
    });
}

export function useCreateCustomWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCustomWorkout,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: keys.workouts.lists(),
            });
        },
    });
}

export function useUpdateWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWorkout,
        onSuccess: (workout) => {
            queryClient.setQueriesData<Workout[] | undefined>(
                { queryKey: keys.workouts.lists() },
                (workouts) => replaceCachedEntity(workouts, workout),
            );
        },
    });
}

export function useDeleteWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWorkout,
        onSuccess: (_, workoutId) => {
            queryClient.setQueriesData<Workout[] | undefined>(
                { queryKey: keys.workouts.lists() },
                (workouts) => removeCachedEntity(workouts, workoutId),
            );
        },
    });
}
