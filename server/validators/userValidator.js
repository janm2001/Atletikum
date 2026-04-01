const AppError = require("../utils/AppError");
const { validateNumberInRange } = require("../utils/validationHelpers");

const DEFAULT_XP_HISTORY_LIMIT = 50;
const DEFAULT_XP_HISTORY_OFFSET = 0;
const MAX_XP_HISTORY_LIMIT = 200;

const validateGetXpHistoryRequest = (request) => {
  const { limit, offset } = request.query ?? {};

  let parsedLimit = DEFAULT_XP_HISTORY_LIMIT;
  let parsedOffset = DEFAULT_XP_HISTORY_OFFSET;

  if (limit !== undefined) {
    parsedLimit = validateNumberInRange(limit, {
      min: 1,
      max: MAX_XP_HISTORY_LIMIT,
      message: `Parametar limit mora biti cijeli broj između 1 i ${MAX_XP_HISTORY_LIMIT}.`,
    });

    if (!Number.isInteger(parsedLimit)) {
      throw new AppError(
        `Parametar limit mora biti cijeli broj između 1 i ${MAX_XP_HISTORY_LIMIT}.`,
        400,
      );
    }
  }

  if (offset !== undefined) {
    parsedOffset = validateNumberInRange(offset, {
      min: 0,
      message: "Parametar offset mora biti nenegativan cijeli broj.",
    });

    if (!Number.isInteger(parsedOffset)) {
      throw new AppError(
        "Parametar offset mora biti nenegativan cijeli broj.",
        400,
      );
    }
  }

  request.query.limit = parsedLimit;
  request.query.offset = parsedOffset;
};

module.exports = {
  validateGetXpHistoryRequest,
};
