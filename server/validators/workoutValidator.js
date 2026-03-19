const AppError = require("../utils/AppError");
const {
  validateNumberInRange,
  validateObjectId,
  validateOptionalNonNegativeNumber,
  validatePositiveNumber,
} = require("../utils/validationHelpers");

const validateOptionalString = (value, fieldLabel) => {
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(`${fieldLabel} mora biti tekst.`, 400);
  }
};

const validateRequiredString = (value, fieldLabel) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(`${fieldLabel} je obavezno polje.`, 400);
  }
};

const validateProgression = (progression, index) => {
  if (progression === undefined) {
    return;
  }

  if (!progression || typeof progression !== "object") {
    throw new AppError(
      `Progressija za vježbu ${index + 1} mora biti valjan objekt.`,
      400,
    );
  }

  if (
    progression.enabled !== undefined &&
    typeof progression.enabled !== "boolean"
  ) {
    throw new AppError(
      `Polje enabled za vježbu ${index + 1} mora biti true ili false.`,
      400,
    );
  }

  if (progression.initialWeightKg !== undefined) {
    validateOptionalNonNegativeNumber(
      progression.initialWeightKg,
      `Početna težina za vježbu ${index + 1} ne može biti negativna.`,
    );
  }

  if (progression.incrementKg !== undefined) {
    validateOptionalNonNegativeNumber(
      progression.incrementKg,
      `Povećanje težine za vježbu ${index + 1} ne može biti negativno.`,
    );
  }
};

const validateWorkoutExercises = (exercises) => {
  if (exercises === undefined) {
    return;
  }

  if (!Array.isArray(exercises)) {
    throw new AppError("Popis vježbi mora biti polje.", 400);
  }

  exercises.forEach((exercise, index) => {
    if (!exercise || typeof exercise !== "object") {
      throw new AppError(`Vježba ${index + 1} nije valjana.`, 400);
    }

    if (!exercise.exerciseId) {
      throw new AppError(
        `Vježba ${index + 1} mora sadržavati exerciseId.`,
        400,
      );
    }
    validateObjectId(exercise.exerciseId, `exerciseId za vježbu ${index + 1}`);

    validatePositiveNumber(
      exercise.sets ?? NaN,
      `Broj serija za vježbu ${index + 1} mora biti veći od 0.`,
    );

    validateOptionalString(exercise.reps, `Ponavljanja za vježbu ${index + 1}`);
    validateOptionalString(exercise.rpe, `RPE za vježbu ${index + 1}`);

    if (exercise.baseXp !== undefined) {
      validateOptionalNonNegativeNumber(
        exercise.baseXp,
        `Base XP za vježbu ${index + 1} ne može biti negativan.`,
      );
    }

    if (exercise.restSeconds !== undefined && exercise.restSeconds !== null) {
      validateNumberInRange(exercise.restSeconds, {
        min: 0,
        max: 600,
        message: `Odmor za vježbu ${index + 1} mora biti između 0 i 600 sekundi.`,
      });
    }

    validateProgression(exercise.progression, index);
  });
};

const validateWorkoutIdRequest = (request) => {
  validateObjectId(request.params.id, "ID treninga");
};

const validateCreateWorkoutRequest = (request) => {
  const payload = request.body ?? {};

  validateRequiredString(payload.title, "Naziv treninga");
  validateOptionalString(payload.description, "Opis treninga");

  if (payload.requiredLevel !== undefined) {
    validateNumberInRange(payload.requiredLevel, {
      min: 1,
      max: 100,
      message: "Razina treninga mora biti između 1 i 100.",
    });
  }

  if (payload.tags !== undefined && !Array.isArray(payload.tags)) {
    throw new AppError("Tagovi moraju biti poslani kao polje.", 400);
  }

  validateWorkoutExercises(payload.exercises);
};

const validateUpdateWorkoutRequest = (request) => {
  validateWorkoutIdRequest(request);
  const payload = request.body ?? {};

  if (payload.title !== undefined) {
    validateRequiredString(payload.title, "Naziv treninga");
  }

  validateOptionalString(payload.description, "Opis treninga");

  if (payload.requiredLevel !== undefined) {
    validateNumberInRange(payload.requiredLevel, {
      min: 1,
      max: 100,
      message: "Razina treninga mora biti između 1 i 100.",
    });
  }

  if (payload.tags !== undefined && !Array.isArray(payload.tags)) {
    throw new AppError("Tagovi moraju biti poslani kao polje.", 400);
  }

  validateWorkoutExercises(payload.exercises);
};

module.exports = {
  validateWorkoutIdRequest,
  validateCreateWorkoutRequest,
  validateUpdateWorkoutRequest,
};
