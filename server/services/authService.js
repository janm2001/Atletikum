const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const { getClientUrl, getJwtSecret } = require("../config/env");
const { sanitizeUser } = require("../utils/sanitizeUser");
const AppError = require("../utils/AppError");

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

const register = async ({
  username,
  email,
  password,
  trainingFrequency,
  focus,
}) => {
  const newUser = await User.create({
    username,
    email: email.trim().toLowerCase(),
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

  const user = await User.findOne({ username });
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

  const user = await User.findOne({
    username: String(username).trim(),
    email: String(email).trim().toLowerCase(),
  });

  if (!user) {
    throw new AppError("Korisnik s tim podacima nije pronađen", 404);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashResetToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  return {
    message: "Privremena poveznica za reset lozinke je kreirana.",
    resetToken,
    resetUrl: buildResetUrl(resetToken),
    expiresAt: user.passwordResetExpires,
  };
};

const resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    throw new AppError("Nedostaje token ili nova lozinka", 400);
  }

  const user = await User.findOne({
    passwordResetToken: hashResetToken(token),
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
