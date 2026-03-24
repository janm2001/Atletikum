const { User } = require("../models/User");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { requireUserId } = require("../utils/userIdentity");

const getLeaderboard = async ({ currentUser, currentUserId }) => {
  const userId = requireUserId({ userId: currentUserId, user: currentUser });

  const [result] = await User.aggregate([
    {
      $facet: {
        topUsers: [
          { $sort: { totalXp: -1 } },
          { $limit: 50 },
          {
            $project: {
              username: 1,
              level: 1,
              totalXp: 1,
              brainXp: 1,
              bodyXp: 1,
              profilePicture: 1,
              dailyStreak: 1,
            },
          },
        ],
        userRank: [
          { $match: { totalXp: { $gt: currentUser.totalXp } } },
          { $count: "count" },
        ],
        nextUser: [
          { $match: { totalXp: { $gt: currentUser.totalXp } } },
          { $sort: { totalXp: 1 } },
          { $limit: 1 },
          { $project: { username: 1, totalXp: 1 } },
        ],
      },
    },
  ]);

  const topUsers = result.topUsers;
  const myRank = (result.userRank[0]?.count ?? 0) + 1;

  const myIndex = topUsers.findIndex((user) => user._id.toString() === userId);

  let nextRankUser = null;
  let xpGapToNextRank = null;

  if (myIndex > 0) {
    const above = topUsers[myIndex - 1];
    nextRankUser = { username: above.username, totalXp: above.totalXp };
    xpGapToNextRank = above.totalXp - currentUser.totalXp;
  } else if (myIndex === -1 && result.nextUser[0]) {
    const aboveUser = result.nextUser[0];
    nextRankUser = { username: aboveUser.username, totalXp: aboveUser.totalXp };
    xpGapToNextRank = aboveUser.totalXp - currentUser.totalXp;
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
