const AppError = require("./AppError");

const XP_PER_CORRECT_ANSWER = 25;
const XP_PER_CORRECT_ANSWER_FAILED = 5;

const assertValidAnswerArray = (quiz, submittedAnswers) => {
  if (!Array.isArray(submittedAnswers)) {
    throw new AppError("Odgovori kviza moraju biti poslani kao polje.", 400);
  }

  if (submittedAnswers.length !== quiz.length) {
    throw new AppError("Broj odgovora mora odgovarati broju pitanja.", 400);
  }
};

const scoreQuizSubmission = (quiz, submittedAnswers) => {
  assertValidAnswerArray(quiz, submittedAnswers);

  let score = 0;
  const normalizedAnswers = submittedAnswers.map((value, index) => {
    const numericValue = Number(value);
    const question = quiz[index];

    if (!Number.isInteger(numericValue)) {
      throw new AppError("Svaki odgovor mora biti važeći indeks opcije.", 400);
    }

    if (numericValue < 0 || numericValue >= question.options.length) {
      throw new AppError("Odgovor sadrži nevažeću opciju.", 400);
    }

    if (numericValue === question.correctIndex) {
      score += 1;
    }

    return numericValue;
  });

  const totalQuestions = quiz.length;
  const passed = totalQuestions > 0 && score / totalQuestions >= 0.5;
  const xpPerAnswer = passed
    ? XP_PER_CORRECT_ANSWER
    : XP_PER_CORRECT_ANSWER_FAILED;
  const xpGained = score * xpPerAnswer;

  return {
    score,
    totalQuestions,
    passed,
    xpGained,
    submittedAnswers: normalizedAnswers,
  };
};

module.exports = {
  XP_PER_CORRECT_ANSWER,
  XP_PER_CORRECT_ANSWER_FAILED,
  scoreQuizSubmission,
};
