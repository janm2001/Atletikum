const {
  scoreQuizSubmission,
  XP_PER_CORRECT_ANSWER,
  XP_PER_CORRECT_ANSWER_FAILED,
} = require("../utils/quizScoring");

describe("quiz scoring", () => {
  const quiz = [
    {
      question: "Q1",
      options: ["A", "B", "C"],
      correctIndex: 1,
    },
    {
      question: "Q2",
      options: ["A", "B", "C"],
      correctIndex: 0,
    },
  ];

  it("scores submitted answers on the server", () => {
    const result = scoreQuizSubmission(quiz, [1, 0]);

    expect(result.score).toBe(2);
    expect(result.totalQuestions).toBe(2);
    expect(result.passed).toBe(true);
    expect(result.xpGained).toBe(2 * XP_PER_CORRECT_ANSWER);
  });

  it("awards no xp when user fails quiz with zero correct answers", () => {
    const result = scoreQuizSubmission(quiz, [2, 2]);

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.xpGained).toBe(0);
  });

  it("awards partial xp when user fails quiz but has some correct answers", () => {
    const threeQuestionQuiz = [
      { question: "Q1", options: ["A", "B", "C"], correctIndex: 0 },
      { question: "Q2", options: ["A", "B", "C"], correctIndex: 1 },
      { question: "Q3", options: ["A", "B", "C"], correctIndex: 2 },
    ];

    const result = scoreQuizSubmission(threeQuestionQuiz, [0, 2, 0]);

    expect(result.score).toBe(1);
    expect(result.passed).toBe(false);
    expect(result.xpGained).toBe(1 * XP_PER_CORRECT_ANSWER_FAILED);
  });

  it("rejects malformed answer arrays", () => {
    expect(() => scoreQuizSubmission(quiz, [1])).toThrow(
      "Broj odgovora mora odgovarati broju pitanja.",
    );
    expect(() => scoreQuizSubmission(quiz, [1, 4])).toThrow(
      "Odgovor sadrži nevažeću opciju.",
    );
  });
});
