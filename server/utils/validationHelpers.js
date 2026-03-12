const mongoose = require("mongoose");
const AppError = require("./AppError");

const createAppError = (message) => new AppError(message, 400);

const throwValidationError = (message, createError) => {
  throw createError(message);
};

const coerceFiniteNumber = (value, message, createError = createAppError) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throwValidationError(message, createError);
  }

  return numericValue;
};

const validateObjectId = (
  value,
  fieldName,
  createError = createAppError,
) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throwValidationError(`${fieldName} nije valjan.`, createError);
  }
};

const validatePositiveNumber = (
  value,
  message,
  createError = createAppError,
) => {
  const numericValue = coerceFiniteNumber(value, message, createError);

  if (numericValue <= 0) {
    throwValidationError(message, createError);
  }

  return numericValue;
};

const validateNumberInRange = (
  value,
  { min = -Infinity, max = Infinity, message, createError = createAppError },
) => {
  const numericValue = coerceFiniteNumber(value, message, createError);

  if (numericValue < min || numericValue > max) {
    throwValidationError(message, createError);
  }

  return numericValue;
};

const validateOptionalNonNegativeNumber = (
  value,
  message,
  createError = createAppError,
) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = coerceFiniteNumber(value, message, createError);

  if (numericValue < 0) {
    throwValidationError(message, createError);
  }

  return numericValue;
};

module.exports = {
  validateNumberInRange,
  validateObjectId,
  validateOptionalNonNegativeNumber,
  validatePositiveNumber,
};
