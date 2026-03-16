const AppError = require("../utils/AppError");
const {
  validateNumberInRange,
  validateObjectId,
} = require("../utils/validationHelpers");

const validateArticleIdRequest = (request) => {
  validateObjectId(request.params.id, "ID članka");
};

const validateUpdateReadingProgressRequest = (request) => {
  validateArticleIdRequest(request);

  const { progressPercent, isCompleted } = request.body ?? {};

  if (progressPercent !== undefined) {
    validateNumberInRange(progressPercent, {
      min: 0,
      max: 100,
      message: "Napredak čitanja mora biti između 0 i 100.",
    });
  }

  if (isCompleted !== undefined && typeof isCompleted !== "boolean") {
    throw new AppError("Polje isCompleted mora biti true ili false.", 400);
  }
};

module.exports = {
  validateArticleIdRequest,
  validateUpdateReadingProgressRequest,
};
