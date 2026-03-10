const XP_PER_CORRECT_ANSWER = 25;

const assertValidAnswerArray = (quiz, submittedAnswers) => {
  if (!Array.isArray(submittedAnswers)) {
    throw new Error("Odgovori kviza moraju biti poslani kao polje.");
  }

  if (submittedAnswers.length !== quiz.length) {
    throw new Error("Broj odgovora mora odgovarati broju pitanja.");
  }
};

const scoreQuizSubmission = (quiz, submittedAnswers) => {
  assertValidAnswerArray(quiz, submittedAnswers);

  let score = 0;
  const normalizedAnswers = submittedAnswers.map((value, index) => {
    const numericValue = Number(value);
    const question = quiz[index];

    if (!Number.isInteger(numericValue)) {
      throw new Error("Svaki odgovor mora biti važeći indeks opcije.");
    }

    if (numericValue < 0 || numericValue >= question.options.length) {
      throw new Error("Odgovor sadrži nevažeću opciju.");
    }

    if (numericValue === question.correctIndex) {
      score += 1;
    }

    return numericValue;
  });

  const totalQuestions = quiz.length;
  const passed = totalQuestions > 0 && score / totalQuestions >= 0.5;
  const xpGained = passed ? score * XP_PER_CORRECT_ANSWER : 0;

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
  scoreQuizSubmission,
};
