const { Friendship } = require("../models/Friendship");
const { User } = require("../models/User");
const AppError = require("../utils/AppError");

const MAX_FRIENDS = 100;
const FRIEND_REQUEST_FIELDS = "username level totalXp dailyStreak profilePicture";

const getFriendshipBetween = (userId, otherUserId) =>
  Friendship.findOne({
    $or: [
      { requester: userId, recipient: otherUserId },
      { requester: otherUserId, recipient: userId },
    ],
  }).lean();

const sendFriendRequest = async ({ userId, username }) => {
  const recipient = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .select("_id username")
    .lean();

  if (!recipient) {
    throw new AppError("Korisnik nije pronađen.", 404);
  }

  if (String(recipient._id) === String(userId)) {
    throw new AppError("Ne možete dodati sebe kao prijatelja.", 400);
  }

  const existing = await getFriendshipBetween(userId, recipient._id);

  if (existing) {
    if (existing.status === "accepted") {
      throw new AppError("Već ste prijatelji s ovim korisnikom.", 409);
    }
    if (existing.status === "pending") {
      throw new AppError("Zahtjev za prijateljstvo je već poslan.", 409);
    }
    if (existing.status === "blocked") {
      throw new AppError("Ne možete poslati zahtjev ovom korisniku.", 403);
    }
  }

  const [myFriendCount] = await Promise.all([
    Friendship.countDocuments({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    }),
  ]);

  if (myFriendCount >= MAX_FRIENDS) {
    throw new AppError(`Dostigli ste maksimalni broj prijatelja (${MAX_FRIENDS}).`, 400);
  }

  const friendship = await Friendship.create({
    requester: userId,
    recipient: recipient._id,
    status: "pending",
  });

  return { friendship, recipient };
};

const getMyFriends = async ({ userId }) => {
  const friendships = await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: "accepted",
  })
    .populate("requester", FRIEND_REQUEST_FIELDS)
    .populate("recipient", FRIEND_REQUEST_FIELDS)
    .sort({ acceptedAt: -1 })
    .lean();

  return friendships.map((f) => {
    const friend =
      String(f.requester._id) === String(userId) ? f.recipient : f.requester;
    return {
      friendshipId: f._id,
      friend,
      acceptedAt: f.acceptedAt,
    };
  });
};

const getPendingRequests = async ({ userId }) => {
  const [incoming, outgoing] = await Promise.all([
    Friendship.find({ recipient: userId, status: "pending" })
      .populate("requester", FRIEND_REQUEST_FIELDS)
      .sort({ createdAt: -1 })
      .lean(),
    Friendship.find({ requester: userId, status: "pending" })
      .populate("recipient", FRIEND_REQUEST_FIELDS)
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return {
    incoming: incoming.map((f) => ({
      friendshipId: f._id,
      user: f.requester,
      createdAt: f.createdAt,
    })),
    outgoing: outgoing.map((f) => ({
      friendshipId: f._id,
      user: f.recipient,
      createdAt: f.createdAt,
    })),
  };
};

const acceptFriendRequest = async ({ userId, friendshipId }) => {
  const friendship = await Friendship.findOne({
    _id: friendshipId,
    recipient: userId,
    status: "pending",
  });

  if (!friendship) {
    throw new AppError("Zahtjev za prijateljstvo nije pronađen.", 404);
  }

  friendship.status = "accepted";
  friendship.acceptedAt = new Date();
  await friendship.save();

  return friendship;
};

const removeFriend = async ({ userId, friendshipId }) => {
  const friendship = await Friendship.findOne({
    _id: friendshipId,
    $or: [{ requester: userId }, { recipient: userId }],
  });

  if (!friendship) {
    throw new AppError("Prijateljstvo nije pronađeno.", 404);
  }

  await friendship.deleteOne();
};

const blockUser = async ({ userId, targetUserId }) => {
  if (String(userId) === String(targetUserId)) {
    throw new AppError("Ne možete blokirati sebe.", 400);
  }

  const existing = await getFriendshipBetween(userId, targetUserId);

  if (existing) {
    await Friendship.findByIdAndUpdate(existing._id, {
      status: "blocked",
      acceptedAt: null,
    });
    return;
  }

  await Friendship.create({
    requester: userId,
    recipient: targetUserId,
    status: "blocked",
  });
};

const getFriendLeaderboard = async ({ userId }) => {
  const friendships = await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: "accepted",
  })
    .select("requester recipient")
    .lean();

  const friendIds = friendships.map((f) =>
    String(f.requester) === String(userId) ? f.recipient : f.requester,
  );

  const users = await User.find({
    _id: { $in: [...friendIds, userId] },
  })
    .select("username level totalXp brainXp bodyXp dailyStreak profilePicture")
    .sort({ totalXp: -1 })
    .lean();

  return users.map((u, index) => ({
    ...u,
    rank: index + 1,
    isMe: String(u._id) === String(userId),
  }));
};

module.exports = {
  sendFriendRequest,
  getMyFriends,
  getPendingRequests,
  acceptFriendRequest,
  removeFriend,
  blockUser,
  getFriendLeaderboard,
};
