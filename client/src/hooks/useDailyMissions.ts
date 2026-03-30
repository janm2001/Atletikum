import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import {
  getTodaysMissions,
  trackArticleRead,
  trackLeaderboardVisit,
} from "@/api/dailyMissionApi";

export const useDailyMissions = () =>
  useQuery({
    queryKey: keys.dailyMissions.today(),
    queryFn: getTodaysMissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useTrackLeaderboardVisit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: trackLeaderboardVisit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.dailyMissions.today() });
    },
  });
};

export const useTrackArticleRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: trackArticleRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.dailyMissions.today() });
    },
  });
};
