import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keys } from '../lib/query-keys';
import { apiClient } from '../utils/apiService';
import type { Workout } from '@/types/Workout/workout';

type WorkoutsResponse = {
    status: string;
    results: number;
    data: {
        workouts: Workout[];
    };
};

export function useWorkouts() {
    return useQuery<Workout[], Error>({
        queryKey: keys.workouts.all,
        queryFn: async () => {
            const { data } = await apiClient.get<WorkoutsResponse>('/workouts');
            return data.data.workouts;
        },
    });
}

export function useCreateWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newWorkout: Partial<Workout>) => {
            const { data } = await apiClient.post('/workouts', newWorkout);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.workouts.all });
        },
    });
}

export function useUpdateWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updatedData }: { id: string; updatedData: Partial<Workout> }) => {
            const { data } = await apiClient.patch(`/workouts/${id}`, updatedData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.workouts.all });
        },
    });
}

export function useDeleteWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await apiClient.delete(`/workouts/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.workouts.all });
        },
    });
}
