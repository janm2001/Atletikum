const {
  scoreQuizSubmission,
  XP_PER_CORRECT_ANSWER,
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

  it("awards no xp when user fails quiz", () => {
    const result = scoreQuizSubmission(quiz, [2, 2]);

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.xpGained).toBe(0);
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
