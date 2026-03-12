const AppError = require("./AppError");

const resolveUserId = ({ userId, user } = {}) => {
  if (userId !== undefined && userId !== null && userId !== "") {
    return String(userId);
  }

  if (user?._id !== undefined && user?._id !== null) {
    return String(user._id);
  }

  return null;
};

const requireUserId = ({ userId, user } = {}) => {
  const resolvedUserId = resolveUserId({ userId, user });

  if (!resolvedUserId) {
    throw new AppError("Niste prijavljeni. Molimo prijavite se.", 401);
  }

  return resolvedUserId;
};

module.exports = {
  resolveUserId,
  requireUserId,
};
