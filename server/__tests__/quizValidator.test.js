const {
  validateQuizStatusRequest,
  validateSubmitQuizRequest,
} = require("../validators/quizValidator");

describe("quizValidator", () => {
  const validArticleId = "507f1f77bcf86cd799439011";

  it("rejects invalid article ids", () => {
    expect(() =>
      validateQuizStatusRequest({
        params: { articleId: "not-an-id" },
      }),
    ).toThrow("ID članka nije valjan.");
  });

  it("rejects invalid answer indices", () => {
    expect(() =>
      validateSubmitQuizRequest({
        params: { articleId: validArticleId },
        body: { submittedAnswers: [0, -1] },
      }),
    ).toThrow("Odgovor na pitanju 2 mora biti važeći indeks opcije.");
  });

  it("accepts valid quiz submissions", () => {
    expect(() =>
      validateSubmitQuizRequest({
        params: { articleId: validArticleId },
        body: { submittedAnswers: [0, "1"] },
      }),
    ).not.toThrow();
  });
});
