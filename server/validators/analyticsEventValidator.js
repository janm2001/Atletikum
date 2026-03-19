const AppError = require("../utils/AppError");

const validateCreateEventRequest = (request) => {
  const { event, payload } = request.body ?? {};

  if (!event || typeof event !== "string" || event.trim().length === 0) {
    throw new AppError("Naziv događaja je obavezan.", 400);
  }

  if (event.length > 100) {
    throw new AppError("Naziv događaja ne smije biti duži od 100 znakova.", 400);
  }

  if (payload !== undefined && payload !== null && typeof payload !== "object") {
    throw new AppError("Payload mora biti objekt.", 400);
  }
};

const validateAbandonedEventRequest = (request) => {
  const { event, payload } = request.body ?? {};

  if (event !== "workout_abandoned") {
    throw new AppError("Samo workout_abandoned događaji su dozvoljeni.", 400);
  }

  if (payload !== undefined && payload !== null && typeof payload !== "object") {
    throw new AppError("Payload mora biti objekt.", 400);
  }
};

module.exports = { validateCreateEventRequest, validateAbandonedEventRequest };
