jest.mock("../models/Workout", () => ({
  Workout: {
    find: jest.fn(),
  },
}));

jest.mock("../models/Article", () => ({
  Article: {
    find: jest.fn(),
  },
}));

jest.mock("../models/WorkoutLog", () => ({
  WorkoutLog: {
    find: jest.fn(),
  },
}));

jest.mock("../models/QuizCompletion", () => ({
  QuizCompletion: {
    find: jest.fn(),
    distinct: jest.fn(),
  },
}));

jest.mock("../models/Exercise", () => ({
  Exercise: {
    find: jest.fn(),
  },
}));

jest.mock("../services/articleService", () => ({
  getBookmarkMap: jest.fn(),
  attachBookmarkState: jest.fn(),
}));

jest.mock("../utils/workoutMetrics", () => ({
  summarizePersonalBests: jest.fn(),
  buildNextSessionSuggestions: jest.fn(),
}));

const { Workout } = require("../models/Workout");
const { Article } = require("../models/Article");
const { WorkoutLog } = require("../models/WorkoutLog");
const { QuizCompletion } = require("../models/QuizCompletion");
const { Exercise } = require("../models/Exercise");
const articleService = require("../services/articleService");
const {
  summarizePersonalBests,
  buildNextSessionSuggestions,
} = require("../utils/workoutMetrics");
const recommendationService = require("../services/recommendationService");

const createSortLimitLeanQuery = (value) => ({
  sort: jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(value),
    }),
  }),
});

describe("recommendationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("assembles weekly recommendations with bookmark-enriched articles", async () => {
    WorkoutLog.find.mockReturnValue(
      createSortLimitLeanQuery([
        {
          date: "2026-03-10T00:00:00.000Z",
          workoutId: "workout-old",
          readinessScore: 4,
          sessionFeedbackScore: 4,
          completedExercises: [{ exerciseId: "exercise-1" }],
        },
      ]),
    );
    QuizCompletion.distinct.mockResolvedValue([]);
    QuizCompletion.find.mockReturnValue(createSortLimitLeanQuery([]));
    Workout.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: "workout-1",
            tags: ["STRENGTH"],
            requiredLevel: 2,
            exercises: [
              { exerciseId: { _id: "exercise-1", title: "Squat" }, reps: "6" },
            ],
          },
        ]),
      }),
    });
    Article.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest
              .fn()
              .mockResolvedValue([{ _id: "article-1", tag: "TRAINING" }]),
          }),
        }),
      }),
    });
    articleService.getBookmarkMap.mockResolvedValue(new Map());
    articleService.attachBookmarkState.mockReturnValue([
      {
        _id: "article-1",
        tag: "TRAINING",
        bookmark: {
          isBookmarked: false,
          progressPercent: 0,
          isCompleted: false,
        },
      },
    ]);
    summarizePersonalBests.mockReturnValue([{ exerciseId: "exercise-1" }]);
    buildNextSessionSuggestions.mockReturnValue([{ exerciseId: "exercise-1" }]);

    const result = await recommendationService.getWeeklyRecommendations({
      user: {
        _id: "user-1",
        focus: "snaga",
        level: 3,
        trainingFrequency: 3,
      },
    });

    expect(result.articles[0]).toEqual(
      expect.objectContaining({
        _id: "article-1",
        bookmark: expect.objectContaining({ isBookmarked: false }),
      }),
    );
    expect(result.insight).toEqual(
      expect.objectContaining({
        focusReason: "Fokus je na snazi i progresivnom opterećenju.",
        lowReadiness: false,
      }),
    );
    expect(result.personalBestSummaries).toEqual([
      { exerciseId: "exercise-1" },
    ]);
    expect(result.nextSessionSuggestions).toEqual([
      { exerciseId: "exercise-1" },
    ]);
    expect(QuizCompletion.distinct).toHaveBeenCalledWith("article", {
      user: "user-1",
    });
    expect(Exercise.find).not.toHaveBeenCalled();
  });

  it("returns the oldest eligible revision completion in weekly recommendations", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-18T10:00:00.000Z"));
    WorkoutLog.find.mockReturnValue(createSortLimitLeanQuery([]));
    QuizCompletion.distinct.mockResolvedValue(["article-completed"]);
    QuizCompletion.find.mockReturnValue(
      createSortLimitLeanQuery([
        {
          article: "article-newer",
          score: 4,
          totalQuestions: 5,
          completedAt: new Date("2026-03-05T10:00:00.000Z"),
        },
      ]),
    );
    Workout.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });
    Article.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
    articleService.getBookmarkMap.mockResolvedValue(new Map());
    articleService.attachBookmarkState.mockReturnValue([]);
    summarizePersonalBests.mockReturnValue([]);
    buildNextSessionSuggestions.mockReturnValue([]);

    const result = await recommendationService.getWeeklyRecommendations({
      user: {
        _id: "user-1",
        focus: "snaga",
        level: 3,
        trainingFrequency: 3,
      },
    });

    expect(QuizCompletion.distinct).toHaveBeenCalledWith("article", {
      user: "user-1",
    });
    expect(QuizCompletion.find).toHaveBeenCalledWith(
      {
        user: "user-1",
        completedAt: { $lte: new Date("2026-03-11T10:00:00.000Z") },
      },
      {
        article: 1,
        score: 1,
        totalQuestions: 1,
        completedAt: 1,
      },
    );
    expect(result.revision).toEqual({
      articleId: "article-newer",
      lastScore: 4,
      totalQuestions: 5,
      completedAt: new Date("2026-03-05T10:00:00.000Z"),
    });
  });
});
