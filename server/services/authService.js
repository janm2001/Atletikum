const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const { sanitizeUser } = require("../utils/sanitizeUser");
const AppError = require("../utils/AppError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const register = async ({ username, password, trainingFrequency, focus }) => {
  const newUser = await User.create({
    username,
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

module.exports = {
  register,
  login,
};
