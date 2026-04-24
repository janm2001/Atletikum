const AppError = require("../utils/AppError");
const { AUTH_MESSAGES } = require("../utils/authMessages");
const {
  VALID_FOCUS_VALUES,
  validateEmail,
  validateLoginIdentifier,
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
    throw new AppError(AUTH_MESSAGES.trainingFrequencyInvalid, 400);
  }
  request.body.trainingFrequency = numericTrainingFrequency;

  if (!VALID_FOCUS_VALUES.includes(focus)) {
    throw new AppError(AUTH_MESSAGES.focusInvalid, 400);
  }
};

const validateLoginRequest = (request) => {
  request.body = request.body ?? {};

  const { username, password } = request.body ?? {};

  request.body.username = validateLoginIdentifier(username);

  if (!password || String(password).length === 0) {
    throw new AppError(AUTH_MESSAGES.loginCredentialsRequired, 400);
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
