const { sanitizeUser } = require("../utils/sanitizeUser");

describe("sanitizeUser", () => {
  const fullUser = {
    _id: "abc123",
    username: "testuser",
    email: "test@example.com",
    password: "hashed_password_secret",
    trainingFrequency: 4,
    focus: "snaga",
    level: 5,
    totalXp: 1200,
    brainXp: 400,
    bodyXp: 800,
    dailyStreak: 7,
    role: "user",
    profilePicture: "https://example.com/pic.jpg",
    achievements: [
      { achievement: "ach1", unlockedAt: new Date() },
      { achievement: "ach2", unlockedAt: new Date() },
    ],
  };

  it("strips the password field", () => {
    const result = sanitizeUser(fullUser);
    expect(result).not.toHaveProperty("password");
  });

  it("includes all expected public fields", () => {
    const result = sanitizeUser(fullUser);
    expect(result).toEqual(
      expect.objectContaining({
        _id: "abc123",
        username: "testuser",
        email: "test@example.com",
        trainingFrequency: 4,
        focus: "snaga",
        level: 5,
        totalXp: 1200,
        brainXp: 400,
        bodyXp: 800,
        dailyStreak: 7,
        role: "user",
        profilePicture: "https://example.com/pic.jpg",
      }),
    );
  });

  it("includes achievements array", () => {
    const result = sanitizeUser(fullUser);
    expect(result).toHaveProperty("achievements");
    expect(result.achievements).toHaveLength(2);
  });

  it("returns null for null/undefined input", () => {
    expect(sanitizeUser(null)).toBeNull();
    expect(sanitizeUser(undefined)).toBeNull();
  });
});
