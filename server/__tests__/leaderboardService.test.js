jest.mock("../models/User", () => ({
  User: {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

const { User } = require("../models/User");
const leaderboardService = require("../services/leaderboardService");

const createLeaderboardUser = (id, username, totalXp) => ({
  _id: { toString: () => id },
  username,
  level: 1,
  totalXp,
  brainXp: Math.floor(totalXp / 2),
  bodyXp: totalXp - Math.floor(totalXp / 2),
  profilePicture: "",
  dailyStreak: 0,
});

const mockFindChain = (result) => ({
  sort: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(result),
      }),
    }),
  }),
});

const mockFindOneChain = (result) => ({
  sort: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(result),
    }),
  }),
});

describe("leaderboardService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns nextRankUser and xpGapToNextRank when user is in the leaderboard", async () => {
    const topUsers = [
      createLeaderboardUser("u1", "Leader", 1000),
      createLeaderboardUser("u2", "Runner", 800),
      createLeaderboardUser("u3", "Me", 600),
    ];

    User.find.mockReturnValue(mockFindChain(topUsers));

    const currentUser = {
      _id: "u3",
      username: "Me",
      totalXp: 600,
      level: 2,
      brainXp: 300,
      bodyXp: 300,
      dailyStreak: 1,
      role: "user",
      achievements: [],
    };

    const result = await leaderboardService.getLeaderboard({
      currentUser,
      currentUserId: "u3",
    });

    expect(result.myRank).toBe(3);
    expect(result.nextRankUser).toEqual({
      username: "Runner",
      totalXp: 800,
    });
    expect(result.xpGapToNextRank).toBe(200);
  });

  it("returns null nextRankUser when user is first place", async () => {
    const topUsers = [
      createLeaderboardUser("u1", "Me", 1000),
      createLeaderboardUser("u2", "Runner", 800),
    ];

    User.find.mockReturnValue(mockFindChain(topUsers));

    const currentUser = {
      _id: "u1",
      username: "Me",
      totalXp: 1000,
      level: 3,
      brainXp: 500,
      bodyXp: 500,
      dailyStreak: 5,
      role: "user",
      achievements: [],
    };

    const result = await leaderboardService.getLeaderboard({
      currentUser,
      currentUserId: "u1",
    });

    expect(result.myRank).toBe(1);
    expect(result.nextRankUser).toBeNull();
    expect(result.xpGapToNextRank).toBeNull();
  });

  it("queries for next rank user when current user is outside top 50", async () => {
    const topUsers = [
      createLeaderboardUser("u1", "Leader", 5000),
    ];

    User.find.mockReturnValue(mockFindChain(topUsers));
    User.countDocuments.mockResolvedValue(100);
    User.findOne.mockReturnValue(
      mockFindOneChain({
        username: "JustAbove",
        totalXp: 120,
      }),
    );

    const currentUser = {
      _id: "u999",
      username: "Me",
      totalXp: 100,
      level: 1,
      brainXp: 50,
      bodyXp: 50,
      dailyStreak: 0,
      role: "user",
      achievements: [],
    };

    const result = await leaderboardService.getLeaderboard({
      currentUser,
      currentUserId: "u999",
    });

    expect(result.myRank).toBe(101);
    expect(result.nextRankUser).toEqual({
      username: "JustAbove",
      totalXp: 120,
    });
    expect(result.xpGapToNextRank).toBe(20);
  });
});
