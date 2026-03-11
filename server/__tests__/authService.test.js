jest.mock("crypto", () => ({
  randomBytes: jest.fn(),
  createHash: jest.fn(),
}));

jest.mock("../models/User", () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("../utils/sanitizeUser", () => ({
  sanitizeUser: jest.fn(),
}));

const { User } = require("../models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sanitizeUser } = require("../utils/sanitizeUser");
const authService = require("../services/authService");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.CLIENT_URL = "http://localhost:5173";

    crypto.createHash.mockReturnValue({
      update: jest.fn().mockReturnValue({
        digest: jest.fn().mockReturnValue("hashed-reset-token"),
      }),
    });
  });

  it("registers a user and returns token plus sanitized payload", async () => {
    const createdUser = {
      _id: "user-1",
      username: "jan",
      trainingFrequency: 4,
      focus: "snaga",
    };

    User.create.mockResolvedValue(createdUser);
    jwt.sign.mockReturnValue("signed-token");
    sanitizeUser.mockReturnValue({ _id: "user-1", username: "jan" });

    const result = await authService.register({
      username: "jan",
      email: "jan@example.com",
      password: "secret123",
      trainingFrequency: 4,
      focus: "snaga",
    });

    expect(User.create).toHaveBeenCalledWith({
      username: "jan",
      email: "jan@example.com",
      password: "secret123",
      trainingFrequency: 4,
      focus: "snaga",
    });
    expect(jwt.sign).toHaveBeenCalledWith({ id: "user-1" }, "test-secret", {
      expiresIn: "7d",
    });
    expect(result).toEqual({
      token: "signed-token",
      user: { _id: "user-1", username: "jan" },
    });
  });

  it("rejects login when credentials are missing", async () => {
    await expect(
      authService.login({ username: "", password: "" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Molimo unesite username i lozinku",
    });
  });

  it("rejects login when password does not match", async () => {
    User.findOne.mockResolvedValue({ _id: "user-1", password: "hash" });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.login({ username: "jan", password: "wrong" }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Pogrešni podaci",
    });
  });

  it("creates a password reset token for a matching username and email", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    User.findOne.mockResolvedValue({
      _id: "user-1",
      username: "jan",
      email: "jan@example.com",
      save,
    });
    crypto.randomBytes.mockReturnValue({
      toString: jest.fn().mockReturnValue("raw-reset-token"),
    });

    const result = await authService.requestPasswordReset({
      username: "jan",
      email: "jan@example.com",
    });

    expect(User.findOne).toHaveBeenCalledWith({
      username: "jan",
      email: "jan@example.com",
    });
    expect(save).toHaveBeenCalledWith({ validateBeforeSave: false });
    expect(result).toEqual(
      expect.objectContaining({
        resetToken: "raw-reset-token",
        resetUrl: "http://localhost:5173/reset-lozinka/raw-reset-token",
      }),
    );
  });

  it("resets password for a valid non-expired reset token", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    User.findOne.mockResolvedValue({
      _id: "user-1",
      password: "old-password",
      passwordResetToken: "hashed-reset-token",
      passwordResetExpires: new Date(Date.now() + 60_000),
      save,
    });

    const result = await authService.resetPassword({
      token: "raw-reset-token",
      password: "NewSecret123!",
    });

    expect(User.findOne).toHaveBeenCalledWith({
      passwordResetToken: "hashed-reset-token",
      passwordResetExpires: { $gt: expect.any(Date) },
    });
    expect(save).toHaveBeenCalled();
    expect(result).toEqual({
      message: "Lozinka je uspješno promijenjena.",
    });
  });
});
