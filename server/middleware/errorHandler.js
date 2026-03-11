const mongoose = require("mongoose");

const isCastError = (error) => error instanceof mongoose.Error.CastError;
const isValidationError = (error) =>
  error instanceof mongoose.Error.ValidationError;

const errorHandler = (error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (isCastError(error)) {
    return response.status(400).json({
      status: "fail",
      message: `Invalid ${error.path}: ${error.value}`,
    });
  }

  if (isValidationError(error)) {
    const message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(", ");

    return response.status(400).json({
      status: "fail",
      message,
    });
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || (statusCode >= 500 ? "error" : "fail");

  return response.status(statusCode).json({
    status,
    message: error.message || "Greška na serveru",
  });
};

module.exports = errorHandler;
