const {
  validateRegisterRequest,
  validateResetPasswordRequest,
} = require("../validators/authValidator");

describe("authValidator", () => {
  it("normalizes register username, email, and training frequency", () => {
    const request = {
      body: {
        username: " Jan ",
        email: " JAN@example.com ",
        password: "Strong123!",
        trainingFrequency: "4",
        focus: "snaga",
      },
    };

    expect(() => validateRegisterRequest(request)).not.toThrow();
    expect(request.body.username).toBe("Jan");
    expect(request.body.email).toBe("jan@example.com");
    expect(request.body.trainingFrequency).toBe(4);
  });

  it("rejects weak register passwords", () => {
    const request = {
      body: {
        username: "jan",
        email: "jan@example.com",
        password: "weakpass1!",
        trainingFrequency: 4,
        focus: "snaga",
      },
    };

    expect(() => validateRegisterRequest(request)).toThrow(
      "Lozinka mora sadržavati barem jedno veliko slovo",
    );
  });

  it("rejects invalid reset token formats", () => {
    const request = {
      body: { password: "Strong123!" },
      params: { token: "invalid-token" },
    };

    expect(() => validateResetPasswordRequest(request)).toThrow(
      "Token za reset lozinke nije valjan",
    );
  });

  it("rejects reset passwords longer than 32 characters", () => {
    const request = {
      body: { password: `Aa1!${"a".repeat(29)}` },
      params: { token: "a".repeat(64) },
    };

    expect(() => validateResetPasswordRequest(request)).toThrow(
      "Lozinka može imati najviše 32 znaka",
    );
  });
});
