const { User } = require("../models/User");
const { sanitizeUser } = require("../utils/sanitizeUser");

exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ totalXp: -1 })
      .limit(50)
      .select(
        "username level totalXp brainXp bodyXp profilePicture dailyStreak",
      )
      .lean();

    const userId = req.user._id.toString();
    let myRank = null;
    const myIndex = topUsers.findIndex((u) => u._id.toString() === userId);

    if (myIndex !== -1) {
      myRank = myIndex + 1;
    } else {
      const count = await User.countDocuments({
        totalXp: { $gt: req.user.totalXp },
      });
      myRank = count + 1;
    }

    res.status(200).json({
      status: "success",
      data: {
        leaderboard: topUsers,
        myRank,
        me: sanitizeUser(req.user),
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
