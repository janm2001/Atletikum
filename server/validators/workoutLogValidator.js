const AppError = require("../utils/AppError");
const {
  validateNumberInRange,
  validateObjectId,
  validateOptionalNonNegativeNumber,
  validatePositiveNumber,
} = require("../utils/validationHelpers");

const DEFAULT_WORKOUT_LOGS_PAGE = 1;
const DEFAULT_WORKOUT_LOGS_LIMIT = 30;

const validateCreateWorkoutLogRequest = (request) => {
  const { workoutId, completedExercises } = request.body ?? {};

  validateObjectId(workoutId, "Workout");

  if (!Array.isArray(completedExercises) || completedExercises.length === 0) {
    throw new AppError("Workout i odrađeni setovi su obavezni.", 400);
  }

  completedExercises.forEach((exercise, index) => {
    if (!exercise || typeof exercise !== "object") {
      throw new AppError(`Vježba ${index + 1} nije valjana.`, 400);
    }

    if (!exercise.exerciseId) {
      throw new AppError(
        `Vježba ${index + 1} mora sadržavati exerciseId.`,
        400,
      );
    }

    validatePositiveNumber(
      exercise.resultValue ?? exercise.reps ?? NaN,
      `Rezultat za vježbu ${index + 1} mora biti veći od 0.`,
    );

    validateNumberInRange(exercise.rpe ?? NaN, {
      min: 1,
      max: 10,
      message: `RPE za vježbu ${index + 1} mora biti između 1 i 10.`,
    });

    validateOptionalNonNegativeNumber(
      exercise.loadKg ?? exercise.weight,
      `Opterećenje za vježbu ${index + 1} ne može biti negativno.`,
    );
  });
};

const validateGetLatestWorkoutLogRequest = (request) => {
  validateObjectId(request.params.workoutId, "Workout");
};

const validateGetWorkoutLogsRequest = (request) => {
  const { page, limit } = request.query ?? {};

  let parsedPage = DEFAULT_WORKOUT_LOGS_PAGE;
  let parsedLimit = DEFAULT_WORKOUT_LOGS_LIMIT;

  if (page !== undefined) {
    parsedPage = validateNumberInRange(page, {
      min: 1,
      message: "Parametar page mora biti pozitivan cijeli broj.",
    });

    if (!Number.isInteger(parsedPage)) {
      throw new AppError(
        "Parametar page mora biti pozitivan cijeli broj.",
        400,
      );
    }
  }

  if (limit !== undefined) {
    parsedLimit = validateNumberInRange(limit, {
      min: 1,
      max: 100,
      message: "Parametar limit mora biti cijeli broj između 1 i 100.",
    });

    if (!Number.isInteger(parsedLimit)) {
      throw new AppError(
        "Parametar limit mora biti cijeli broj između 1 i 100.",
        400,
      );
    }
  }

  request.query.page = parsedPage;
  request.query.limit = parsedLimit;
};

module.exports = {
  validateCreateWorkoutLogRequest,
  validateGetLatestWorkoutLogRequest,
  validateGetWorkoutLogsRequest,
};
