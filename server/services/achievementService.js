const { Achievement } = require("../models/Achievement");
const { User } = require("../models/User");

const getMyAchievements = async ({ userId }) => {
  const allAchievements = await Achievement.find().lean();
  const user = await User.findById(userId).lean();

  const unlockedMap = new Map(
    (user?.achievements || []).map((achievement) => [
      achievement.achievement.toString(),
      achievement.unlockedAt,
    ]),
  );

  return allAchievements.map((achievement) => ({
    ...achievement,
    isUnlocked: unlockedMap.has(achievement._id.toString()),
    unlockedAt: unlockedMap.get(achievement._id.toString()) || null,
  }));
};

module.exports = {
  getMyAchievements,
};
