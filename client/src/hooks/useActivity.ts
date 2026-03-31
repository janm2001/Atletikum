import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { addReaction, getActivityFeed, removeReaction } from "@/api/activityApi";
import type { AllowedEmoji } from "@/types/Activity/activity";

export const useActivityFeed = (page = 1) =>
  useQuery({
    queryKey: keys.activity.feed(page),
    queryFn: () => getActivityFeed(page),
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
  });

export const useAddReaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, emoji }: { eventId: string; emoji: AllowedEmoji }) =>
      addReaction(eventId, emoji),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.activity.all });
    },
  });
};

export const useRemoveReaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => removeReaction(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.activity.all });
    },
  });
};
