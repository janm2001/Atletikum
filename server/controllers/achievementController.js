const { Achievement } = require("../models/Achievement");
const { User } = require("../models/User");

exports.getMyAchievements = async (req, res) => {
  try {
    const allAchievements = await Achievement.find().lean();
    const user = await User.findById(req.user._id).lean();

    const unlockedMap = new Map(
      (user?.achievements || []).map((a) => [
        a.achievement.toString(),
        a.unlockedAt,
      ]),
    );

    const achievements = allAchievements.map((ach) => ({
      ...ach,
      isUnlocked: unlockedMap.has(ach._id.toString()),
      unlockedAt: unlockedMap.get(ach._id.toString()) || null,
    }));

    res.status(200).json({
      status: "success",
      results: achievements.length,
      data: { achievements },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
