const {
  validateRegisterRequest,
  validateLoginRequest,
  validateResetPasswordRequest,
} = require("../validators/authValidator");
const { AUTH_MESSAGES } = require("../utils/authMessages");

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
      AUTH_MESSAGES.passwordUppercase,
    );
  });

  it("accepts login identifier when email is provided", () => {
    const request = {
      body: {
        username: " Jan@Example.com ",
        password: "Strong123!",
      },
    };

    expect(() => validateLoginRequest(request)).not.toThrow();
    expect(request.body.username).toBe("jan@example.com");
  });

  it("rejects invalid reset token formats", () => {
    const request = {
      body: { password: "Strong123!" },
      params: { token: "invalid-token" },
    };

    expect(() => validateResetPasswordRequest(request)).toThrow(
      AUTH_MESSAGES.resetTokenInvalid,
    );
  });

  it("rejects reset passwords longer than 32 characters", () => {
    const request = {
      body: { password: `Aa1!${"a".repeat(29)}` },
      params: { token: "a".repeat(64) },
    };

    expect(() => validateResetPasswordRequest(request)).toThrow(
      AUTH_MESSAGES.passwordMax,
    );
  });
});
