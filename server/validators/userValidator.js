const { validateIntegerInRange } = require("../utils/validationHelpers");

const DEFAULT_XP_HISTORY_LIMIT = 50;
const DEFAULT_XP_HISTORY_OFFSET = 0;
const MAX_XP_HISTORY_LIMIT = 200;

const validateGetXpHistoryRequest = (request) => {
  const { limit, offset } = request.query ?? {};

  let parsedLimit = DEFAULT_XP_HISTORY_LIMIT;
  let parsedOffset = DEFAULT_XP_HISTORY_OFFSET;

  if (limit !== undefined) {
    parsedLimit = validateIntegerInRange(limit, {
      min: 1,
      max: MAX_XP_HISTORY_LIMIT,
      message: `Parametar limit mora biti cijeli broj između 1 i ${MAX_XP_HISTORY_LIMIT}.`,
    });
  }

  if (offset !== undefined) {
    parsedOffset = validateIntegerInRange(offset, {
      min: 0,
      message: "Parametar offset mora biti nenegativan cijeli broj.",
    });
  }

  request.validatedQuery = { limit: parsedLimit, offset: parsedOffset };
};

module.exports = {
  validateGetXpHistoryRequest,
};
