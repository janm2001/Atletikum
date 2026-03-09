const FORBIDDEN_PATTERN = /^\$|\..*\$/;

function sanitizeValue(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    return FORBIDDEN_PATTERN.test(value) ? "" : value;
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
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);

  if (req.query && typeof req.query === "object") {
    sanitizeObject(req.query);
  }

  next();
}

module.exports = sanitizeMongo;
