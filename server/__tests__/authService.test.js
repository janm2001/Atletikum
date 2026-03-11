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
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sanitizeUser } = require("../utils/sanitizeUser");
const authService = require("../services/authService");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
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
      password: "secret123",
      trainingFrequency: 4,
      focus: "snaga",
    });

    expect(User.create).toHaveBeenCalledWith({
      username: "jan",
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
});
