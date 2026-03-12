const { User } = require("../models/User");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { requireUserId } = require("../utils/userIdentity");

const getLeaderboard = async ({ currentUser, currentUserId }) => {
  const topUsers = await User.find()
    .sort({ totalXp: -1 })
    .limit(50)
    .select("username level totalXp brainXp bodyXp profilePicture dailyStreak")
    .lean();

  const userId = requireUserId({ userId: currentUserId, user: currentUser });
  const myIndex = topUsers.findIndex((user) => user._id.toString() === userId);

  let myRank = null;
  if (myIndex !== -1) {
    myRank = myIndex + 1;
  } else {
    const count = await User.countDocuments({
      totalXp: { $gt: currentUser.totalXp },
    });
    myRank = count + 1;
  }

  return {
    leaderboard: topUsers,
    myRank,
    me: sanitizeUser(currentUser),
  };
};

module.exports = {
  getLeaderboard,
};
