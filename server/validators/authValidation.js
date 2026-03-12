const AppError = require("../utils/AppError");

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
    throw new AppError("Korisničko ime mora imati barem 3 znaka", 400);
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    throw new AppError("Korisničko ime može imati najviše 30 znakova", 400);
  }

  return username;
};

const validateEmail = (value) => {
  const email = normalizeEmail(value);

  if (!email || !EMAIL_REGEX.test(email)) {
    throw new AppError("Molimo unesite valjanu email adresu", 400);
  }

  if (email.length > EMAIL_MAX_LENGTH) {
    throw new AppError("Email adresa može imati najviše 254 znaka", 400);
  }

  return email;
};

const validatePassword = (value) => {
  const password = String(value ?? "");

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AppError("Lozinka mora imati barem 8 znakova", 400);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new AppError("Lozinka može imati najviše 32 znaka", 400);
  }

  if (!/[a-z]/.test(password)) {
    throw new AppError("Lozinka mora sadržavati barem jedno malo slovo", 400);
  }

  if (!/[A-Z]/.test(password)) {
    throw new AppError("Lozinka mora sadržavati barem jedno veliko slovo", 400);
  }

  if (!/[0-9]/.test(password)) {
    throw new AppError("Lozinka mora sadržavati barem jedan broj", 400);
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    throw new AppError("Lozinka mora sadržavati barem jedan poseban znak", 400);
  }

  return password;
};

const validateResetToken = (value) => {
  const token = normalizeString(value);

  if (!RESET_TOKEN_REGEX.test(token)) {
    throw new AppError("Token za reset lozinke nije valjan", 400);
  }

  return token;
};

module.exports = {
  VALID_FOCUS_VALUES,
  validateEmail,
  validatePassword,
  validateResetToken,
  validateUsername,
};
