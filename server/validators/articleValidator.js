const AppError = require("../utils/AppError");
const {
  validateNumberInRange,
  validateObjectId,
} = require("../utils/validationHelpers");

const validateGetArticlesRequest = (request) => {
  const { q } = request.query ?? {};

  if (q !== undefined) {
    if (typeof q !== "string") {
      throw new AppError("Parametar pretrage mora biti tekst.", 400);
    }
    if (q.trim().length === 0) {
      throw new AppError("Parametar pretrage ne smije biti prazan.", 400);
    }
    if (q.length > 100) {
      throw new AppError("Pretraga ne smije biti dulja od 100 znakova.", 400);
    }
  }
};

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
  validateGetArticlesRequest,
  validateArticleIdRequest,
  validateUpdateReadingProgressRequest,
};
