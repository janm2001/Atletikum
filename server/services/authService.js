const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const { getClientUrl, getJwtSecret, getNodeEnv } = require("../config/env");
const { sanitizeUser } = require("../utils/sanitizeUser");
const AppError = require("../utils/AppError");

const PASSWORD_RESET_REQUEST_MESSAGE =
  "Ako uneseni podaci odgovaraju korisniku, upute za reset lozinke su pripremljene.";

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
    throw new AppError("Molimo unesite username i lozinku", 400);
  }

  const user = await User.findOne({ username: String(username).trim() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Pogrešni podaci", 401);
  }

  return {
    token: signToken(user._id),
    user: sanitizeUser(user),
  };
};

const requestPasswordReset = async ({ username, email }) => {
  if (!username || !email) {
    throw new AppError("Molimo unesite korisničko ime i email adresu", 400);
  }

  const normalizedUsername = String(username).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({
    username: normalizedUsername,
    email: normalizedEmail,
  });

  if (!user) {
    return {
      message: PASSWORD_RESET_REQUEST_MESSAGE,
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashResetToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  logDevelopmentResetUrl(buildResetUrl(resetToken));

  return {
    message: PASSWORD_RESET_REQUEST_MESSAGE,
  };
};

const resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    throw new AppError("Nedostaje token ili nova lozinka", 400);
  }

  const normalizedToken = String(token).trim();
  const user = await User.findOne({
    passwordResetToken: hashResetToken(normalizedToken),
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(
      "Poveznica za reset lozinke nije valjana ili je istekla",
      400,
    );
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return {
    message: "Lozinka je uspješno promijenjena.",
  };
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
};
