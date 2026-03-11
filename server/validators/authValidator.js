const AppError = require("../utils/AppError");

const VALID_FOCUS_VALUES = ["mobilnost", "snaga", "prevencija_ozlijede"];

const validateEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(String(email ?? "").trim());
};

const validateRegisterRequest = (request) => {
  const { username, email, password, trainingFrequency, focus } =
    request.body ?? {};

  if (!username || String(username).trim().length < 3) {
    throw new AppError("Korisničko ime mora imati barem 3 znaka", 400);
  }

  if (!validateEmail(email)) {
    throw new AppError("Molimo unesite valjanu email adresu", 400);
  }

  if (!password || String(password).length < 8) {
    throw new AppError("Lozinka mora imati barem 8 znakova", 400);
  }

  const numericTrainingFrequency = Number(trainingFrequency);
  if (
    !Number.isInteger(numericTrainingFrequency) ||
    numericTrainingFrequency < 0 ||
    numericTrainingFrequency > 7
  ) {
    throw new AppError("Frekvencija treninga mora biti između 0 i 7", 400);
  }

  if (!VALID_FOCUS_VALUES.includes(focus)) {
    throw new AppError("Fokus treninga nije valjan", 400);
  }
};

const validateLoginRequest = (request) => {
  const { username, password } = request.body ?? {};

  if (!username || !password) {
    throw new AppError("Molimo unesite username i lozinku", 400);
  }
};

const validateRequestPasswordResetRequest = (request) => {
  const { username, email } = request.body ?? {};

  if (!username || String(username).trim().length < 3) {
    throw new AppError("Korisničko ime mora imati barem 3 znaka", 400);
  }

  if (!validateEmail(email)) {
    throw new AppError("Molimo unesite valjanu email adresu", 400);
  }
};

const validateResetPasswordRequest = (request) => {
  if (!request.params?.token) {
    throw new AppError("Token za reset lozinke nedostaje", 400);
  }

  const { password } = request.body ?? {};
  if (!password || String(password).length < 8) {
    throw new AppError("Lozinka mora imati barem 8 znakova", 400);
  }
};

module.exports = {
  validateRegisterRequest,
  validateLoginRequest,
  validateRequestPasswordResetRequest,
  validateResetPasswordRequest,
};
