import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWeeklyPlan, updateWeeklyPlanProgress } from "@/api/weeklyPlanApi";
import { keys } from "@/lib/query-keys";

export const useWeeklyPlan = () => {
  return useQuery({
    queryKey: keys.weeklyPlan.current(),
    queryFn: getWeeklyPlan,
    staleTime: 30 * 1000,
  });
};

export const useMarkDayComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (day: number) => updateWeeklyPlanProgress(day),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.weeklyPlan.current() });
    },
  });
};
