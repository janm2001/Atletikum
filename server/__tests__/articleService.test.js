jest.mock("../models/Article", () => ({
  Article: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock("../models/ArticleBookmark", () => ({
  ArticleBookmark: {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

const { Article } = require("../models/Article");
const { ArticleBookmark } = require("../models/ArticleBookmark");
const articleService = require("../services/articleService");

const createLeanQuery = (value) => ({
  lean: jest.fn().mockResolvedValue(value),
});
const createArticleQuery = (value) => ({
  select: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(value),
    }),
  }),
});

describe("articleService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty saved articles when user has no bookmarks", async () => {
    ArticleBookmark.find.mockReturnValue({
      select: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
    });

    const result = await articleService.getAllArticles({
      userId: "user-1",
      query: { saved: "true" },
    });

    expect(result).toEqual([]);
    expect(Article.find).not.toHaveBeenCalled();
  });

  it("normalizes bookmark state when toggling a bookmark", async () => {
    ArticleBookmark.findOneAndUpdate.mockReturnValue(
      createLeanQuery({
        isBookmarked: true,
        progressPercent: 25,
        isCompleted: false,
        savedAt: new Date("2026-03-11T10:00:00.000Z"),
      }),
    );

    const result = await articleService.toggleBookmark({
      userId: "user-1",
      articleId: "article-1",
      shouldBookmark: true,
    });

    expect(result).toEqual(
      expect.objectContaining({
        isBookmarked: true,
        progressPercent: 25,
        isCompleted: false,
      }),
    );
  });
});
