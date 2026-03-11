import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createWorkout,
    deleteWorkout,
    getWorkouts,
    updateWorkout,
} from '@/api/workouts';
import { keys } from '../lib/query-keys';
import type { Workout } from '@/types/Workout/workout';

export function useWorkouts() {
    return useQuery<Workout[], Error>({
        queryKey: keys.workouts.all,
        queryFn: getWorkouts,
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
