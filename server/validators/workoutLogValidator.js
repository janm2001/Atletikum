const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const validateCreateWorkoutLogRequest = (request) => {
  const { workoutId, completedExercises } = request.body ?? {};

  if (!mongoose.Types.ObjectId.isValid(workoutId)) {
    throw new AppError("Workout nije valjan.", 400);
  }

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

    const resultValue = Number(exercise.resultValue ?? exercise.reps ?? NaN);
    if (!Number.isFinite(resultValue) || resultValue <= 0) {
      throw new AppError(
        `Rezultat za vježbu ${index + 1} mora biti veći od 0.`,
        400,
      );
    }

    const rpe = Number(exercise.rpe ?? NaN);
    if (!Number.isFinite(rpe) || rpe < 1 || rpe > 10) {
      throw new AppError(
        `RPE za vježbu ${index + 1} mora biti između 1 i 10.`,
        400,
      );
    }

    const rawLoad = exercise.loadKg ?? exercise.weight;
    if (rawLoad !== undefined && rawLoad !== null && rawLoad !== "") {
      const load = Number(rawLoad);
      if (!Number.isFinite(load) || load < 0) {
        throw new AppError(
          `Opterećenje za vježbu ${index + 1} ne može biti negativno.`,
          400,
        );
      }
    }
  });
};

module.exports = {
  validateCreateWorkoutLogRequest,
};
