const AppError = require("../utils/AppError");
const MuscleGroup = require("../enums/MuscleGroup.enum");
const {
  validateNumberInRange,
  validateObjectId,
} = require("../utils/validationHelpers");

const validateRequiredString = (value, fieldLabel) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(`${fieldLabel} je obavezno polje.`, 400);
  }
};

const validateOptionalString = (value, fieldLabel) => {
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(`${fieldLabel} mora biti tekst.`, 400);
  }
};

const validateMuscleGroup = (value) => {
  if (!Object.values(MuscleGroup).includes(value)) {
    throw new AppError("Mišićna skupina nije valjana.", 400);
  }
};

const validateExerciseIdRequest = (request) => {
  validateObjectId(request.params.id, "ID vježbe");
};

const validateCreateExerciseRequest = (request) => {
  const payload = request.body ?? {};

  validateRequiredString(payload.title, "Naziv vježbe");
  validateRequiredString(payload.description, "Opis vježbe");

  if (payload.muscleGroup === undefined) {
    throw new AppError("Mišićna skupina je obavezno polje.", 400);
  }
  validateMuscleGroup(payload.muscleGroup);

  if (payload.level === undefined) {
    throw new AppError("Razina vježbe je obavezno polje.", 400);
  }

  validateNumberInRange(payload.level, {
    min: 1,
    max: 100,
    message: "Razina vježbe mora biti između 1 i 100.",
  });

  validateOptionalString(payload.videoLink, "Video link");
  validateOptionalString(payload.imageLink, "Link slike");
};

const validateUpdateExerciseRequest = (request) => {
  validateExerciseIdRequest(request);
  const payload = request.body ?? {};

  if (payload.title !== undefined) {
    validateRequiredString(payload.title, "Naziv vježbe");
  }

  if (payload.description !== undefined) {
    validateRequiredString(payload.description, "Opis vježbe");
  }

  if (payload.muscleGroup !== undefined) {
    validateMuscleGroup(payload.muscleGroup);
  }

  if (payload.level !== undefined) {
    validateNumberInRange(payload.level, {
      min: 1,
      max: 100,
      message: "Razina vježbe mora biti između 1 i 100.",
    });
  }

  validateOptionalString(payload.videoLink, "Video link");
  validateOptionalString(payload.imageLink, "Link slike");
};

module.exports = {
  validateExerciseIdRequest,
  validateCreateExerciseRequest,
  validateUpdateExerciseRequest,
};
