jest.mock("../models/QuizCompletion", () => ({
  QuizCompletion: {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../models/Article", () => ({
  Article: {
    findById: jest.fn(),
  },
}));

jest.mock("../services/userProgressService", () => ({
  applyUserProgress: jest.fn(),
}));

const { QuizCompletion } = require("../models/QuizCompletion");
const { Article } = require("../models/Article");
const { applyUserProgress } = require("../services/userProgressService");
const quizService = require("../services/quizService");

const createSortedQuery = (value) => ({
  sort: jest.fn().mockResolvedValue(value),
});

describe("quizService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits quiz, persists completion, and updates user progress when passed", async () => {
    QuizCompletion.findOne.mockReturnValue(createSortedQuery(null));
    Article.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        quiz: [
          { options: ["A", "B"], correctIndex: 0 },
          { options: ["A", "B"], correctIndex: 1 },
        ],
      }),
    });
    QuizCompletion.create.mockResolvedValue({
      score: 2,
      totalQuestions: 2,
      xpGained: 50,
      completedAt: new Date("2026-03-11T10:00:00.000Z"),
      passed: true,
    });
    applyUserProgress.mockResolvedValue({
      user: { _id: "user-1", totalXp: 50 },
      newAchievements: [{ key: "quiz-first" }],
    });

    const result = await quizService.submitQuiz({
      userId: "user-1",
      articleId: "507f191e810c19729de860ea",
      submittedAnswers: [0, 1],
    });

    expect(QuizCompletion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user-1",
        article: "507f191e810c19729de860ea",
        score: 2,
        xpGained: 50,
        passed: true,
        submittedAnswers: [0, 1],
      }),
    );
    expect(applyUserProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        brainXp: 50,
        shouldUpdateStreak: true,
        shouldUnlockAchievements: true,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        user: { _id: "user-1", totalXp: 50 },
        newAchievements: [{ key: "quiz-first" }],
      }),
    );
  });

  it("returns status with cooldown when a recent completion exists", async () => {
    const completedAt = new Date();
    QuizCompletion.findOne.mockReturnValue(
      createSortedQuery({
        score: 3,
        totalQuestions: 4,
        xpGained: 75,
        completedAt,
        passed: true,
      }),
    );

    const result = await quizService.getQuizStatus({
      userId: "user-1",
      articleId: "507f191e810c19729de860ea",
    });

    expect(result.canTakeQuiz).toBe(false);
    expect(result.lastCompletion).toEqual(
      expect.objectContaining({
        score: 3,
        totalQuestions: 4,
        xpGained: 75,
        passed: true,
      }),
    );
    expect(result.nextAvailableAt).toBeInstanceOf(Date);
  });
});
