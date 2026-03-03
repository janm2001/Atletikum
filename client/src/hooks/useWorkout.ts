import { useQuery } from '@tanstack/react-query';
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
        queryKey: ['workout'],
        queryFn: async () => {
            const { data } = await apiClient.get<WorkoutsResponse>('/workouts');
            return data.data.workouts;
        },
    });
}
