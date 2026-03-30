const asyncHandler = require("../middleware/asyncHandler");
const friendService = require("../services/friendService");

exports.sendFriendRequest = asyncHandler(async (req, res) => {
  const { friendship, recipient } = await friendService.sendFriendRequest({
    userId: req.userId,
    username: req.body.username.trim(),
  });

  res.status(201).json({
    status: "success",
    data: { friendship, recipient },
  });
});

exports.getMyFriends = asyncHandler(async (req, res) => {
  const friends = await friendService.getMyFriends({ userId: req.userId });

  res.status(200).json({
    status: "success",
    results: friends.length,
    data: { friends },
  });
});

exports.getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await friendService.getPendingRequests({ userId: req.userId });

  res.status(200).json({
    status: "success",
    data: { requests },
  });
});

exports.acceptFriendRequest = asyncHandler(async (req, res) => {
  const friendship = await friendService.acceptFriendRequest({
    userId: req.userId,
    friendshipId: req.params.friendshipId,
  });

  res.status(200).json({
    status: "success",
    data: { friendship },
  });
});

exports.removeFriend = asyncHandler(async (req, res) => {
  await friendService.removeFriend({
    userId: req.userId,
    friendshipId: req.params.friendshipId,
  });

  res.status(204).send();
});

exports.blockUser = asyncHandler(async (req, res) => {
  await friendService.blockUser({
    userId: req.userId,
    targetUserId: req.params.userId,
  });

  res.status(204).send();
});

exports.getFriendLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await friendService.getFriendLeaderboard({
    userId: req.userId,
  });

  res.status(200).json({
    status: "success",
    results: leaderboard.length,
    data: { leaderboard },
  });
});
