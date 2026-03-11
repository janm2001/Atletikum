import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createWorkout,
    createCustomWorkout,
    deleteWorkout,
    getWorkouts,
    updateWorkout,
} from '@/api/workouts';
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.workouts.all });
        },
    });
}

export function useCreateCustomWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCustomWorkout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.workouts.all });
        },
    });
}

export function useUpdateWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWorkout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.workouts.all });
        },
    });
}

export function useDeleteWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWorkout,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.workouts.all });
        },
    });
}
