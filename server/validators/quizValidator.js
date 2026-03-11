const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

const validateObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`${fieldName} nije valjan.`, 400);
  }
};

const validateQuizStatusRequest = (request) => {
  validateObjectId(request.params.articleId, "ID članka");
};

const validateSubmitQuizRequest = (request) => {
  validateObjectId(request.params.articleId, "ID članka");

  const { submittedAnswers } = request.body ?? {};
  if (!Array.isArray(submittedAnswers)) {
    throw new AppError("Odgovori kviza moraju biti poslani kao polje.", 400);
  }

  if (submittedAnswers.length === 0) {
    throw new AppError("Potrebno je poslati barem jedan odgovor kviza.", 400);
  }

  submittedAnswers.forEach((answer, index) => {
    const numericAnswer = Number(answer);
    if (!Number.isInteger(numericAnswer) || numericAnswer < 0) {
      throw new AppError(
        `Odgovor na pitanju ${index + 1} mora biti važeći indeks opcije.`,
        400,
      );
    }
  });
};

module.exports = {
  validateQuizStatusRequest,
  validateSubmitQuizRequest,
};
