const AppError = require("./AppError");

const ensureResourceExists = (resource, notFoundMessage) => {
  if (!resource) {
    throw new AppError(notFoundMessage, 404);
  }

  return resource;
};

const ensureAdminOrOwner = ({ ownerId, userId, userRole, message }) => {
  const isAdmin = userRole === "admin";
  const isOwner =
    ownerId !== null &&
    ownerId !== undefined &&
    String(ownerId) === String(userId);

  if (!isAdmin && !isOwner) {
    throw new AppError(message, 403);
  }
};

module.exports = {
  ensureResourceExists,
  ensureAdminOrOwner,
};
