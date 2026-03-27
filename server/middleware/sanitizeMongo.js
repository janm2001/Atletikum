const FORBIDDEN_PATTERN = /^\$|\..*\$/;
const AppError = require("../utils/AppError");

function sanitizeValue(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    if (FORBIDDEN_PATTERN.test(value)) {
      throw new AppError("Nevažeći znakovi u zahtjevu.", 400);
    }
    return value;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = sanitizeValue(value[i]);
    }
    return value;
  }

  if (typeof value === "object") {
    sanitizeObject(value);
    return value;
  }

  return value;
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_PATTERN.test(key)) {
      delete obj[key];
    } else {
      obj[key] = sanitizeValue(obj[key]);
    }
  }
}

function sanitizeMongo(req, _res, next) {
  try {
    if (req.body) sanitizeObject(req.body);
    if (req.params) sanitizeObject(req.params);
    if (req.query && typeof req.query === "object") {
      sanitizeObject(req.query);
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = sanitizeMongo;
