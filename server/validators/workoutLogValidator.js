const AppError = require("../utils/AppError");
const {
  validateNumberInRange,
  validateObjectId,
  validateOptionalNonNegativeNumber,
  validatePositiveNumber,
} = require("../utils/validationHelpers");

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

module.exports = {
  validateCreateWorkoutLogRequest,
  validateGetLatestWorkoutLogRequest,
};
