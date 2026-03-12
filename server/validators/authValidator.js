const AppError = require("../utils/AppError");
const {
  VALID_FOCUS_VALUES,
  validateEmail,
  validatePassword,
  validateResetToken,
  validateUsername,
} = require("./authValidation");

const validateRegisterRequest = (request) => {
  request.body = request.body ?? {};

  const { username, email, password, trainingFrequency, focus } =
    request.body ?? {};

  request.body.username = validateUsername(username);
  request.body.email = validateEmail(email);
  request.body.password = validatePassword(password);

  const numericTrainingFrequency = Number(trainingFrequency);
  if (
    !Number.isInteger(numericTrainingFrequency) ||
    numericTrainingFrequency < 0 ||
    numericTrainingFrequency > 7
  ) {
    throw new AppError("Frekvencija treninga mora biti između 0 i 7", 400);
  }
  request.body.trainingFrequency = numericTrainingFrequency;

  if (!VALID_FOCUS_VALUES.includes(focus)) {
    throw new AppError("Fokus treninga nije valjan", 400);
  }
};

const validateLoginRequest = (request) => {
  request.body = request.body ?? {};

  const { username, password } = request.body ?? {};

  request.body.username = validateUsername(username);

  if (!password || String(password).length === 0) {
    throw new AppError("Molimo unesite username i lozinku", 400);
  }
};

const validateRequestPasswordResetRequest = (request) => {
  request.body = request.body ?? {};

  const { username, email } = request.body ?? {};

  request.body.username = validateUsername(username);
  request.body.email = validateEmail(email);
};

const validateResetPasswordRequest = (request) => {
  request.body = request.body ?? {};
  request.params = request.params ?? {};

  request.params.token = validateResetToken(request.params.token);
  request.body.password = validatePassword(request.body.password);
};

module.exports = {
  validateRegisterRequest,
  validateLoginRequest,
  validateRequestPasswordResetRequest,
  validateResetPasswordRequest,
};
