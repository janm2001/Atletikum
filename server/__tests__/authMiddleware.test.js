jest.mock("../models/User", () => ({
  User: {
    findById: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => {
  class TokenExpiredError extends Error {}
  class JsonWebTokenError extends Error {}

  return {
    verify: jest.fn(),
    TokenExpiredError,
    JsonWebTokenError,
  };
});

const { User } = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, restrictTo } = require("../middleware/authMiddleware");

describe("authMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("protect", () => {
    it("rejects requests without a bearer token", async () => {
      const request = { headers: {} };
      const response = {};
      const next = jest.fn();

      await protect(request, response, next);

      expect(User.findById).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Niste prijavljeni. Molimo prijavite se.",
        }),
      );
    });

    it("sets req.user and req.userId for valid tokens", async () => {
      const request = {
        headers: {
          authorization: "Bearer valid-token",
        },
      };
      const response = {};
      const next = jest.fn();
      const currentUser = { _id: "user-1", role: "user" };

      jwt.verify.mockReturnValue({ id: "user-1" });
      User.findById.mockResolvedValue(currentUser);

      await protect(request, response, next);

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
      expect(User.findById).toHaveBeenCalledWith("user-1");
      expect(request.user).toBe(currentUser);
      expect(request.userId).toBe("user-1");
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0]).toEqual([]);
    });

    it("returns a specific error for expired tokens", async () => {
      const request = {
        headers: {
          authorization: "Bearer expired-token",
        },
      };
      const response = {};
      const next = jest.fn();

      jwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError("expired");
      });

      await protect(request, response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Token je istekao. Molimo prijavite se ponovno.",
        }),
      );
    });

    it("passes database lookup failures to the error handler", async () => {
      const request = {
        headers: {
          authorization: "Bearer valid-token",
        },
      };
      const response = {};
      const next = jest.fn();
      const databaseError = new Error("Database offline");

      jwt.verify.mockReturnValue({ id: "user-1" });
      User.findById.mockRejectedValue(databaseError);

      await protect(request, response, next);

      expect(next).toHaveBeenCalledWith(databaseError);
    });
  });

  describe("restrictTo", () => {
    it("rejects users without the required role", () => {
      const middleware = restrictTo("admin");
      const request = {
        user: { role: "user" },
      };
      const response = {};
      const next = jest.fn();

      middleware(request, response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: "Nemate dozvolu za ovu radnju.",
        }),
      );
    });
  });
});
