const AppError = require("../utils/AppError");
const { AUTH_MESSAGES } = require("../utils/authMessages");

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const RESET_TOKEN_REGEX = /^[a-f0-9]{64}$/i;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 32;
const VALID_FOCUS_VALUES = ["mobilnost", "snaga", "prevencija_ozlijede"];

const normalizeString = (value) => String(value ?? "").trim();

const normalizeEmail = (value) => normalizeString(value).toLowerCase();

const validateUsername = (value) => {
  const username = normalizeString(value);

  if (username.length < USERNAME_MIN_LENGTH) {
    throw new AppError(AUTH_MESSAGES.usernameMin, 400);
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    throw new AppError(AUTH_MESSAGES.usernameMax, 400);
  }

  return username;
};

const validateEmail = (value) => {
  const email = normalizeEmail(value);

  if (!email || !EMAIL_REGEX.test(email)) {
    throw new AppError(AUTH_MESSAGES.emailInvalid, 400);
  }

  if (email.length > EMAIL_MAX_LENGTH) {
    throw new AppError(AUTH_MESSAGES.emailMax, 400);
  }

  return email;
};

const validateLoginIdentifier = (value) => {
  const identifier = normalizeString(value);

  if (EMAIL_REGEX.test(identifier)) {
    return normalizeEmail(identifier);
  }

  return validateUsername(identifier);
};

const validatePassword = (value) => {
  const password = String(value ?? "");

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AppError(AUTH_MESSAGES.passwordMin, 400);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new AppError(AUTH_MESSAGES.passwordMax, 400);
  }

  if (!/[a-z]/.test(password)) {
    throw new AppError(AUTH_MESSAGES.passwordLowercase, 400);
  }

  if (!/[A-Z]/.test(password)) {
    throw new AppError(AUTH_MESSAGES.passwordUppercase, 400);
  }

  if (!/[0-9]/.test(password)) {
    throw new AppError(AUTH_MESSAGES.passwordNumber, 400);
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    throw new AppError(AUTH_MESSAGES.passwordSpecial, 400);
  }

  return password;
};

const validateResetToken = (value) => {
  const token = normalizeString(value);

  if (!RESET_TOKEN_REGEX.test(token)) {
    throw new AppError(AUTH_MESSAGES.resetTokenInvalid, 400);
  }

  return token;
};

module.exports = {
  VALID_FOCUS_VALUES,
  validateEmail,
  validateLoginIdentifier,
  validatePassword,
  validateResetToken,
  validateUsername,
};
