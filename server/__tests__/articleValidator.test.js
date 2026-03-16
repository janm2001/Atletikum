const {
  validateArticleIdRequest,
  validateUpdateReadingProgressRequest,
} = require("../validators/articleValidator");

describe("articleValidator", () => {
  const validArticleId = "507f1f77bcf86cd799439011";

  it("rejects invalid article id for bookmark/progress routes", () => {
    const request = { params: { id: "invalid-id" } };

    expect(() => validateArticleIdRequest(request)).toThrow(
      "ID članka nije valjan.",
    );
  });

  it("accepts valid progress payload", () => {
    const request = {
      params: { id: validArticleId },
      body: { progressPercent: 50, isCompleted: false },
    };

    expect(() => validateUpdateReadingProgressRequest(request)).not.toThrow();
  });

  it("rejects out of range progress payload", () => {
    const request = {
      params: { id: validArticleId },
      body: { progressPercent: 120 },
    };

    expect(() => validateUpdateReadingProgressRequest(request)).toThrow(
      "Napredak čitanja mora biti između 0 i 100.",
    );
  });
});
