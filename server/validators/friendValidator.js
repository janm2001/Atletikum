const AppError = require("../utils/AppError");
const { validateObjectId } = require("../utils/validationHelpers");

const validateSendFriendRequest = (request) => {
  const { username } = request.body ?? {};

  if (!username || typeof username !== "string" || !username.trim()) {
    throw new AppError("Korisničko ime je obavezno.", 400);
  }

  if (username.trim().length > 50) {
    throw new AppError("Korisničko ime je predugo.", 400);
  }
};

const validateFriendshipId = (request) => {
  validateObjectId(request.params.friendshipId, "ID prijateljstva");
};

const validateBlockUserId = (request) => {
  validateObjectId(request.params.userId, "ID korisnika");
};

module.exports = {
  validateSendFriendRequest,
  validateFriendshipId,
  validateBlockUserId,
};
