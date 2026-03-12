const mongoose = require("mongoose");
const multer = require("multer");

const isCastError = (error) => error instanceof mongoose.Error.CastError;
const isValidationError = (error) =>
  error instanceof mongoose.Error.ValidationError;
const isDuplicateKeyError = (error) => error?.code === 11000;
const isMulterError = (error) => error instanceof multer.MulterError;

const getMulterMessage = (error) => {
  switch (error.code) {
    case "LIMIT_FILE_SIZE":
      return "Datoteka može imati najviše 5 MB.";
    case "LIMIT_FILE_COUNT":
      return "Moguće je poslati samo jednu datoteku.";
    case "LIMIT_FIELD_COUNT":
      return "Poslano je previše polja u obrascu.";
    case "LIMIT_FIELD_KEY":
      return "Naziv jednog od polja u obrascu je predugačak.";
    case "LIMIT_FIELD_VALUE":
      return "Jedno od polja u obrascu je preveliko.";
    case "LIMIT_UNEXPECTED_FILE":
      return "Neočekivano polje za upload datoteke.";
    default:
      return error.message || "Upload datoteke nije valjan.";
  }
};

const errorHandler = (error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (isMulterError(error)) {
    return response.status(400).json({
      status: "fail",
      message: getMulterMessage(error),
    });
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

  if (isDuplicateKeyError(error)) {
    const duplicateField = Object.keys(error.keyPattern ?? {})[0] ?? "value";

    return response.status(400).json({
      status: "fail",
      message: `${duplicateField} already exists`,
    });
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || (statusCode >= 500 ? "error" : "fail");

  return response.status(statusCode).json({
    status,
    message: error.message || "Greška na serveru",
    ...(error.details ?? {}),
  });
};

module.exports = errorHandler;
