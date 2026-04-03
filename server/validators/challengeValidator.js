const AppError = require("../utils/AppError");
const { validateObjectId } = require("../utils/validationHelpers");
const {
  VALID_CHALLENGE_TEMPLATE_TYPES,
} = require("../constants/challengeTypes");

const ERR_TYPE = `type mora biti jedan od: ${VALID_CHALLENGE_TEMPLATE_TYPES.join(", ")}`;
const ERR_TARGET_COUNT = "targetCount mora biti cijeli broj >= 1";
const ERR_XP_REWARD = "xpReward mora biti cijeli broj >= 1";
const ERR_DESCRIPTION = "description mora biti tekst duljine 1-180 znakova";

const validateClaimChallengeRewardRequest = (request) => {
  validateObjectId(request.params.challengeId, "ID izazova");
};

const validateCreateTemplateRequest = (request) => {
  const { type, targetCount, xpReward, description } = request.body ?? {};

  if (!type || !VALID_CHALLENGE_TEMPLATE_TYPES.includes(type)) {
    throw new AppError(ERR_TYPE, 400);
  }

  if (!Number.isInteger(targetCount) || targetCount < 1) {
    throw new AppError(ERR_TARGET_COUNT, 400);
  }

  if (!Number.isInteger(xpReward) || xpReward < 1) {
    throw new AppError(ERR_XP_REWARD, 400);
  }

  if (
    typeof description !== "string" ||
    description.length < 1 ||
    description.length > 180
  ) {
    throw new AppError(ERR_DESCRIPTION, 400);
  }
};

const validateUpdateTemplateRequest = (request) => {
  validateObjectId(request.params.templateId, "ID predloška");

  const allowedFields = [
    "type",
    "targetCount",
    "xpReward",
    "description",
    "enabled",
  ];
  const hasAnyField = allowedFields.some(
    (f) => request.body?.[f] !== undefined,
  );

  if (!hasAnyField) {
    throw new AppError(
      "Potrebno je unijeti barem jedno polje za ažuriranje.",
      400,
    );
  }

  const { type, targetCount, xpReward, description, enabled } = request.body;

  if (type !== undefined && !VALID_CHALLENGE_TEMPLATE_TYPES.includes(type)) {
    throw new AppError(ERR_TYPE, 400);
  }

  if (
    targetCount !== undefined &&
    (!Number.isInteger(targetCount) || targetCount < 1)
  ) {
    throw new AppError(ERR_TARGET_COUNT, 400);
  }

  if (xpReward !== undefined && (!Number.isInteger(xpReward) || xpReward < 1)) {
    throw new AppError(ERR_XP_REWARD, 400);
  }

  if (
    description !== undefined &&
    (typeof description !== "string" ||
      description.length < 1 ||
      description.length > 180)
  ) {
    throw new AppError(ERR_DESCRIPTION, 400);
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
