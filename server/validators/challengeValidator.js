const AppError = require("../utils/AppError");
const { validateObjectId } = require("../utils/validationHelpers");

const VALID_TEMPLATE_TYPES = ["quiz", "workout", "reading", "custom"];

const validateClaimChallengeRewardRequest = (request) => {
  validateObjectId(request.params.challengeId, "ID izazova");
};

const validateCreateTemplateRequest = (request) => {
  const { type, targetCount, xpReward, description } = request.body ?? {};

  if (!type || !VALID_TEMPLATE_TYPES.includes(type)) {
    throw new AppError(
      `type mora biti jedan od: ${VALID_TEMPLATE_TYPES.join(", ")}`,
      400,
    );
  }

  if (!Number.isInteger(targetCount) || targetCount < 1) {
    throw new AppError("targetCount mora biti cijeli broj >= 1", 400);
  }

  if (!Number.isInteger(xpReward) || xpReward < 1) {
    throw new AppError("xpReward mora biti cijeli broj >= 1", 400);
  }

  if (
    typeof description !== "string" ||
    description.length < 1 ||
    description.length > 180
  ) {
    throw new AppError("description mora biti tekst duljine 1-180 znakova", 400);
  }
};

const validateUpdateTemplateRequest = (request) => {
  validateObjectId(request.params.templateId, "ID predloška");

  const allowedFields = ["type", "targetCount", "xpReward", "description", "enabled"];
  const hasAnyField = allowedFields.some((f) => request.body?.[f] !== undefined);

  if (!hasAnyField) {
    throw new AppError("Potrebno je unijeti barem jedno polje za ažuriranje.", 400);
  }

  const { type, targetCount, xpReward, description, enabled } = request.body;

  if (type !== undefined && !VALID_TEMPLATE_TYPES.includes(type)) {
    throw new AppError(
      `type mora biti jedan od: ${VALID_TEMPLATE_TYPES.join(", ")}`,
      400,
    );
  }

  if (targetCount !== undefined && (!Number.isInteger(targetCount) || targetCount < 1)) {
    throw new AppError("targetCount mora biti cijeli broj >= 1", 400);
  }

  if (xpReward !== undefined && (!Number.isInteger(xpReward) || xpReward < 1)) {
    throw new AppError("xpReward mora biti cijeli broj >= 1", 400);
  }

  if (
    description !== undefined &&
    (typeof description !== "string" ||
      description.length < 1 ||
      description.length > 180)
  ) {
    throw new AppError("description mora biti tekst duljine 1-180 znakova", 400);
  }

  if (enabled !== undefined && typeof enabled !== "boolean") {
    throw new AppError("enabled mora biti boolean vrijednost.", 400);
  }
};

const validatePublishTemplatesRequest = (request) => {
  const { effectiveFromWeekStart } = request.body ?? {};

  if (!effectiveFromWeekStart) {
    throw new AppError("effectiveFromWeekStart je obavezno polje.", 400);
  }

  if (isNaN(Date.parse(effectiveFromWeekStart))) {
    throw new AppError("effectiveFromWeekStart mora biti valjani datum.", 400);
  }
};

module.exports = {
  validateClaimChallengeRewardRequest,
  validateCreateTemplateRequest,
  validateUpdateTemplateRequest,
  validatePublishTemplatesRequest,
};
