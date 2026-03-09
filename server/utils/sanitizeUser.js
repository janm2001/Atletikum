const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    _id: user._id,
    username: user.username,
    trainingFrequency: user.trainingFrequency,
    focus: user.focus,
    level: user.level,
    totalXp: user.totalXp,
    brainXp: user.brainXp,
    bodyXp: user.bodyXp,
    dailyStreak: user.dailyStreak,
    role: user.role,
    profilePicture: user.profilePicture,
  };
};

module.exports = { sanitizeUser };
