const {
  getClientUrl,
  getJwtSecret,
  getMongoUri,
  getPort,
  validateServerEnvironment,
} = require("../config/env");

describe("env config helpers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.JWT_SECRET;
    delete process.env.MONGO_URI;
    delete process.env.CLIENT_URL;
    delete process.env.PORT;
    process.env.ARTICLE_IMAGE_STORAGE = "local";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("validates required environment variables", () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.MONGO_URI = "mongodb://localhost:27017/atletikum";

    expect(() => validateServerEnvironment()).not.toThrow();
    expect(getJwtSecret()).toBe("test-secret");
    expect(getMongoUri()).toBe("mongodb://localhost:27017/atletikum");
  });

  it("throws when JWT_SECRET is missing", () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/atletikum";

    expect(() => validateServerEnvironment()).toThrow(
      "Missing required environment variable: JWT_SECRET",
    );
  });

  it("throws when MONGO_URI is missing", () => {
    process.env.JWT_SECRET = "test-secret";

    expect(() => validateServerEnvironment()).toThrow(
      "Missing required environment variable: MONGO_URI",
    );
  });

  it("normalizes CLIENT_URL and PORT values", () => {
    process.env.CLIENT_URL = "http://localhost:5173/";
    process.env.PORT = "6000";

    expect(getClientUrl()).toBe("http://localhost:5173");
    expect(getPort()).toBe(6000);
  });

  it("falls back to defaults for optional values", () => {
    expect(getClientUrl()).toBe("http://localhost:5173");
    expect(getPort()).toBe(5001);
  });
});
