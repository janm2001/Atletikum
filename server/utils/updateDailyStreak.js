const { User } = require("../models/User");

const updateDailyStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

  if (user.lastActivityDate) {
    const lastStr = new Date(user.lastActivityDate).toISOString().slice(0, 10);

    if (lastStr === todayStr) {
      return user;
    }

    const lastDay = new Date(lastStr);
    const today = new Date(todayStr);
    const diffMs = today.getTime() - lastDay.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.dailyStreak += 1;
    } else {
      user.dailyStreak = 1;
    }
  } else {
    user.dailyStreak = 1;
  }

  user.lastActivityDate = now;
  await user.save();
  return user;
};

module.exports = { updateDailyStreak };
