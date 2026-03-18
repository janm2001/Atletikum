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

  let nextRankUser = null;
  let xpGapToNextRank = null;

  if (myIndex > 0) {
    const above = topUsers[myIndex - 1];
    nextRankUser = { username: above.username, totalXp: above.totalXp };
    xpGapToNextRank = above.totalXp - currentUser.totalXp;
  } else if (myIndex === -1 && topUsers.length > 0) {
    const aboveUser = await User.findOne({
      totalXp: { $gt: currentUser.totalXp },
    })
      .sort({ totalXp: 1 })
      .select("username totalXp")
      .lean();

    if (aboveUser) {
      nextRankUser = {
        username: aboveUser.username,
        totalXp: aboveUser.totalXp,
      };
      xpGapToNextRank = aboveUser.totalXp - currentUser.totalXp;
    }
  }

  return {
    leaderboard: topUsers,
    myRank,
    me: sanitizeUser(currentUser),
    nextRankUser,
    xpGapToNextRank,
  };
};

module.exports = {
  getLeaderboard,
};
