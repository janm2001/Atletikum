const AppError = require("../utils/AppError");

const validateMarkDayCompleteRequest = (request) => {
  const { day } = request.body ?? {};

  if (day === undefined || day === null) {
    throw new AppError("Polje 'day' je obavezno.", 400);
  }

  const numericDay = Number(day);
  if (!Number.isInteger(numericDay) || numericDay < 1 || numericDay > 7) {
    throw new AppError("Polje 'day' mora biti cijeli broj između 1 i 7.", 400);
  }
};

module.exports = {
  validateMarkDayCompleteRequest,
};
