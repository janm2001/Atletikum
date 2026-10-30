import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/utils/apiService";
import { useUser } from "@/hooks/useUser";
import type { LearningJourney, LessonResult } from "@/types/Learning/learning";

export const useLearningJourney = () => {
  const { user } = useUser();
  return useQuery({
    queryKey: ["learning", user?._id],
    queryFn: async () => (await apiClient.get<{ data: LearningJourney }>("/learning")).data.data,
    enabled: !!user,
    staleTime: 0,
    refetchInterval: 60_000,
  });
};

export const useCompleteLesson = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, answer }: { lessonId: string; answer: number }) =>
      (await apiClient.post<{ data: LessonResult }>(`/learning/lessons/${lessonId}/complete`, { answer })).data.data,
    onSuccess: (result) => {
      if (result.journey) queryClient.setQueryData(["learning", user?._id], result.journey);
    },
  });
};

export const useChooseRest = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await apiClient.post<{ data: LearningJourney }>("/learning/rest")).data.data,
    onSuccess: (journey) => queryClient.setQueryData(["learning", user?._id], journey),
  });
};
