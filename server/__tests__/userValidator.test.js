const { validateGetXpHistoryRequest } = require("../validators/userValidator");

describe("userValidator", () => {
  it("applies default xp history query values", () => {
    const request = { query: {} };

    expect(() => validateGetXpHistoryRequest(request)).not.toThrow();
    expect(request.validatedQuery.limit).toBe(50);
    expect(request.validatedQuery.offset).toBe(0);
  });

  it("normalizes valid xp history query values", () => {
    const request = { query: { limit: "100", offset: "20" } };

    expect(() => validateGetXpHistoryRequest(request)).not.toThrow();
    expect(request.validatedQuery.limit).toBe(100);
    expect(request.validatedQuery.offset).toBe(20);
  });

  it("rejects invalid limit values", () => {
    expect(() =>
      validateGetXpHistoryRequest({ query: { limit: "0" } }),
    ).toThrow("Parametar limit mora biti cijeli broj između 1 i 200.");

    expect(() =>
      validateGetXpHistoryRequest({ query: { limit: "2.5" } }),
    ).toThrow("Parametar limit mora biti cijeli broj između 1 i 200.");
  });

  it("rejects invalid offset values", () => {
    expect(() =>
      validateGetXpHistoryRequest({ query: { offset: "-1" } }),
    ).toThrow("Parametar offset mora biti nenegativan cijeli broj.");

    expect(() =>
      validateGetXpHistoryRequest({ query: { offset: "3.14" } }),
    ).toThrow("Parametar offset mora biti nenegativan cijeli broj.");
  });
});
