const { ActivityEvent } = require("../models/ActivityEvent");
const { Friendship } = require("../models/Friendship");
const AppError = require("../utils/AppError");

const FEED_PAGE_SIZE = 20;

/**
 * Fire-and-forget activity event creation.
 * Always call as: createActivityEvent({...}).catch(() => {})
 */
const createActivityEvent = async ({ userId, type, data = {} }) => {
  await ActivityEvent.create({ user: userId, type, data });
};

const getFriendIds = async (userId) => {
  const friendships = await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: "accepted",
  })
    .select("requester recipient")
    .lean();

  const friendIds = friendships.map((f) =>
    String(f.requester) === String(userId) ? f.recipient : f.requester,
  );

  // Exclude any users involved in a blocked relationship (either direction)
  const blocked = await Friendship.find({
    $or: [
      { requester: userId, status: "blocked" },
      { recipient: userId, status: "blocked" },
    ],
  })
    .select("requester recipient")
    .lean();

  const blockedIds = new Set(
    blocked.map((f) =>
      String(f.requester) === String(userId)
        ? String(f.recipient)
        : String(f.requester),
    ),
  );

  return friendIds.filter((id) => !blockedIds.has(String(id)));
};

const getActivityFeed = async ({ userId, page = 1 }) => {
  const friendIds = await getFriendIds(userId);

  if (friendIds.length === 0) {
    return { events: [], total: 0, page, hasMore: false };
  }

  const skip = (page - 1) * FEED_PAGE_SIZE;

  const [events, total] = await Promise.all([
    ActivityEvent.find({ user: { $in: friendIds } })
      .populate("user", "username profilePicture level")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(FEED_PAGE_SIZE)
      .lean(),
    ActivityEvent.countDocuments({ user: { $in: friendIds } }),
  ]);

  return {
    events,
    total,
    page,
    hasMore: skip + events.length < total,
  };
};

const addReaction = async ({ userId, eventId, emoji }) => {
  const event = await ActivityEvent.findById(eventId);
  if (!event) {
    throw new AppError("Aktivnost nije pronađena.", 404);
  }

  // Verify the reacting user is friends with the event owner
  const friendship = await Friendship.findOne({
    $or: [
      { requester: userId, recipient: event.user },
      { requester: event.user, recipient: userId },
    ],
    status: "accepted",
  }).lean();

  if (!friendship) {
    throw new AppError("Nemate pristup ovoj aktivnosti.", 403);
  }

  // Remove existing reaction from this user (one per user)
  event.reactions = event.reactions.filter(
    (r) => String(r.userId) !== String(userId),
  );

  event.reactions.push({ userId, emoji });
  await event.save();

  return event.reactions;
};

const removeReaction = async ({ userId, eventId }) => {
  const event = await ActivityEvent.findById(eventId);
  if (!event) {
    throw new AppError("Aktivnost nije pronađena.", 404);
  }

  // Verify the user is friends with the event owner (or owns the reaction)
  const isSelf = String(event.user) === String(userId);
  if (!isSelf) {
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: event.user },
        { requester: event.user, recipient: userId },
      ],
      status: "accepted",
    }).lean();

    if (!friendship) {
      throw new AppError("Nemate pristup ovoj aktivnosti.", 403);
    }
  }

  event.reactions = event.reactions.filter(
    (r) => String(r.userId) !== String(userId),
  );
  await event.save();

  return event.reactions;
};

module.exports = {
  createActivityEvent,
  getActivityFeed,
  addReaction,
  removeReaction,
};
