import { useQuery } from "@tanstack/react-query";
import { getGamificationStatus } from "@/api/gamification";
import { keys } from "@/lib/query-keys";

export type { GamificationStatus } from "@/types/User/gamification";

export const useGamificationStatus = () => {
  return useQuery({
    queryKey: keys.gamification.status(),
    queryFn: getGamificationStatus,
  });
};
