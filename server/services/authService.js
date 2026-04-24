const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const { getClientUrl, getJwtSecret, getNodeEnv } = require("../config/env");
const { sanitizeUser } = require("../utils/sanitizeUser");
const AppError = require("../utils/AppError");
const { sendPasswordResetEmail } = require("../utils/emailService");
const { AUTH_MESSAGES } = require("../utils/authMessages");

const PASSWORD_RESET_REQUEST_MESSAGE = AUTH_MESSAGES.resetRequestGeneric;

// Pre-computed dummy hash used to ensure constant-time response on login
// regardless of whether the username exists (prevents username enumeration via timing).
const DUMMY_HASH =
  "$2b$12$invaliddummyhashfortimingprotection.AAAAAAAAAAAAAAAAAAA";
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const signToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), { expiresIn: "7d" });
};

const hashResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const buildResetUrl = (resetToken) => {
  const clientUrl = getClientUrl();
  return `${clientUrl}/reset-lozinka/${resetToken}`;
};

const logDevelopmentResetUrl = (resetUrl) => {
  if (getNodeEnv() !== "development") {
    return;
  }

  console.info(`Password reset link (development only): ${resetUrl}`);
};

const register = async ({
  username,
  email,
  password,
  trainingFrequency,
  focus,
}) => {
  const newUser = await User.create({
    username: String(username).trim(),
    email: String(email).trim().toLowerCase(),
    password,
    trainingFrequency,
    focus,
  });

  return {
    token: signToken(newUser._id),
    user: sanitizeUser(newUser),
  };
};

const login = async ({ username, password }) => {
  if (!username || !password) {
    throw new AppError(AUTH_MESSAGES.loginCredentialsRequired, 400);
  }

  const normalizedIdentifier = String(username).trim();
  const loginQuery = EMAIL_REGEX.test(normalizedIdentifier)
    ? { email: normalizedIdentifier.toLowerCase() }
    : { username: normalizedIdentifier };

  const user = await User.findOne(loginQuery).collation({
    locale: "en",
    strength: 2,
  });
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH); // constant-time: prevent username enumeration
    throw new AppError(AUTH_MESSAGES.loginInvalidCredentials, 401);
  }
  if (!(await bcrypt.compare(password, user.password))) {
    throw new AppError(AUTH_MESSAGES.loginInvalidCredentials, 401);
  }

  return {
    token: signToken(user._id),
    user: sanitizeUser(user),
  };
};

const requestPasswordReset = async ({ username, email }) => {
  if (!username || !email) {
    throw new AppError(AUTH_MESSAGES.resetRequestFieldsRequired, 400);
  }

  const normalizedUsername = String(username).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({
    username: normalizedUsername,
    email: normalizedEmail,
  }).collation({ locale: "en", strength: 2 });

  if (!user) {
    return {
      message: PASSWORD_RESET_REQUEST_MESSAGE,
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashResetToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const resetUrl = buildResetUrl(resetToken);
  logDevelopmentResetUrl(resetUrl);

  await sendPasswordResetEmail(user.email, resetUrl);

  return {
    message: PASSWORD_RESET_REQUEST_MESSAGE,
  };
};

const resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    throw new AppError(AUTH_MESSAGES.resetPasswordFieldsRequired, 400);
  }

  const normalizedToken = String(token).trim();
  const user = await User.findOne({
    passwordResetToken: hashResetToken(normalizedToken),
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(AUTH_MESSAGES.resetPasswordInvalidOrExpired, 400);
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return {
    message: AUTH_MESSAGES.resetPasswordSuccess,
  };
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
};
