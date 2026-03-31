import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import {
  acceptFriendRequest,
  blockUser,
  getFriendLeaderboard,
  getMyFriends,
  getPendingRequests,
  removeFriend,
  sendFriendRequest,
} from "@/api/friendApi";

export const useMyFriends = () =>
  useQuery({
    queryKey: keys.friends.list(),
    queryFn: getMyFriends,
  });

export const usePendingRequests = () =>
  useQuery({
    queryKey: keys.friends.requests(),
    queryFn: getPendingRequests,
  });

export const useFriendLeaderboard = () =>
  useQuery({
    queryKey: keys.friends.leaderboard(),
    queryFn: getFriendLeaderboard,
  });

export const useSendFriendRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => sendFriendRequest(username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.friends.requests() });
    },
  });
};

export const useAcceptFriendRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: string) => acceptFriendRequest(friendshipId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.friends.all });
      qc.invalidateQueries({ queryKey: keys.activity.all });
    },
  });
};

export const useRemoveFriend = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendshipId: string) => removeFriend(friendshipId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.friends.all });
    },
  });
};

export const useBlockUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => blockUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.friends.all });
    },
  });
};
