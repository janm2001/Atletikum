import { useQuery } from "@tanstack/react-query";
import { getDailyProgress } from "@/api/weeklyPlanApi";
import { keys } from "@/lib/query-keys";

export const useDailyProgress = () => {
  return useQuery({
    queryKey: keys.dailyProgress.current(),
    queryFn: getDailyProgress,
    staleTime: 30 * 1000,
  });
};
