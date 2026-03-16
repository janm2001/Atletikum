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

jest.mock("../models/Exercise", () => ({
  Exercise: {
    find: jest.fn(),
  },
}));

jest.mock("../utils/uploadCleanup", () => ({
  deleteUploadedRequestFile: jest.fn(),
  deleteUploadByPublicPath: jest.fn(),
}));

jest.mock("../utils/cloudinaryUploads", () => ({
  isCloudinaryStorageEnabled: jest.fn(() => false),
  uploadArticleCoverImage: jest.fn(),
}));

const { Article } = require("../models/Article");
const { ArticleBookmark } = require("../models/ArticleBookmark");
const { Exercise } = require("../models/Exercise");
const {
  deleteUploadedRequestFile,
  deleteUploadByPublicPath,
} = require("../utils/uploadCleanup");
const {
  isCloudinaryStorageEnabled,
  uploadArticleCoverImage,
} = require("../utils/cloudinaryUploads");
const articleService = require("../services/articleService");

const createLeanQuery = (value) => ({
  lean: jest.fn().mockResolvedValue(value),
});
const createArticleQuery = (value) => ({
  select: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(value),
      }),
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

  it("hydrates related exercises on article detail", async () => {
    Article.findById.mockReturnValue(
      createLeanQuery({
        _id: "article-1",
        title: "Article",
        summary: "Summary",
        content: "Content",
        tag: "TRAINING",
        relatedArticleIds: [],
        relatedExerciseIds: ["exercise-2", "exercise-1"],
      }),
    );
    Article.find.mockReturnValue(createArticleQuery([]));
    ArticleBookmark.find.mockReturnValue(createLeanQuery([]));
    Exercise.find.mockReturnValue(
      createLeanQuery([
        { _id: "exercise-1", title: "Sprint A" },
        { _id: "exercise-2", title: "Sprint B" },
      ]),
    );

    const result = await articleService.getArticleById({
      articleId: "article-1",
      userId: "user-1",
    });

    expect(result.relatedExercises).toEqual([
      { _id: "exercise-2", title: "Sprint B" },
      { _id: "exercise-1", title: "Sprint A" },
    ]);
  });

  it("cleans up a newly uploaded file when article creation fails", async () => {
    const uploadError = new Error("create failed");
    const file = {
      filename: "new-cover.png",
      path: "C:\\uploads\\articles\\new-cover.png",
    };

    Article.create.mockRejectedValue(uploadError);

    await expect(
      articleService.createArticle({
        payload: {
          title: "Article",
          summary: "Summary",
          content: "Content",
          tag: "TRAINING",
        },
        file,
      }),
    ).rejects.toThrow(uploadError);

    expect(deleteUploadedRequestFile).toHaveBeenCalledWith(file);
  });

  it("normalizes filename-only coverImage on create", async () => {
    Article.create.mockResolvedValue({
      _id: "article-1",
      coverImage: "/uploads/articles/manual-cover.png",
    });

    await articleService.createArticle({
      payload: {
        title: "Article",
        summary: "Summary",
        content: "Content",
        tag: "TRAINING",
        coverImage: "manual-cover.png",
      },
    });

    expect(Article.create).toHaveBeenCalledWith(
      expect.objectContaining({
        coverImage: "/uploads/articles/manual-cover.png",
      }),
    );
  });

  it("normalizes filesystem-like coverImage on update", async () => {
    Article.findById.mockResolvedValue({
      _id: "article-1",
      coverImage: "/uploads/articles/old-cover.png",
    });
    Article.findByIdAndUpdate.mockResolvedValue({
      _id: "article-1",
      coverImage: "/uploads/articles/manual-cover.png",
    });

    await articleService.updateArticle({
      articleId: "article-1",
      payload: {
        coverImage: "C:\\app\\server\\uploads\\articles\\manual-cover.png",
      },
    });

    expect(Article.findByIdAndUpdate).toHaveBeenCalledWith(
      "article-1",
      expect.objectContaining({
        coverImage: "/uploads/articles/manual-cover.png",
      }),
      expect.objectContaining({
        returnDocument: "after",
        runValidators: true,
      }),
    );
  });

  it("normalizes localhost absolute coverImage URL on create", async () => {
    Article.create.mockResolvedValue({
      _id: "article-1",
      coverImage: "/uploads/articles/manual-cover.png",
    });

    await articleService.createArticle({
      payload: {
        title: "Article",
        summary: "Summary",
        content: "Content",
        tag: "TRAINING",
        coverImage: "http://localhost:5001/uploads/articles/manual-cover.png",
      },
    });

    expect(Article.create).toHaveBeenCalledWith(
      expect.objectContaining({
        coverImage: "/uploads/articles/manual-cover.png",
      }),
    );
  });

  it("removes the previous uploaded cover when article cover changes", async () => {
    Article.findById.mockResolvedValue({
      _id: "article-1",
      coverImage: "/uploads/articles/old-cover.png",
    });
    Article.findByIdAndUpdate.mockResolvedValue({
      _id: "article-1",
      coverImage: "/uploads/articles/new-cover.png",
    });

    const result = await articleService.updateArticle({
      articleId: "article-1",
      payload: { title: "Updated title" },
      file: {
        filename: "new-cover.png",
        path: "C:\\uploads\\articles\\new-cover.png",
      },
    });

    expect(result).toEqual({
      _id: "article-1",
      coverImage: "/uploads/articles/new-cover.png",
    });
    expect(deleteUploadByPublicPath).toHaveBeenCalledWith(
      "/uploads/articles/old-cover.png",
    );
    expect(deleteUploadedRequestFile).not.toHaveBeenCalled();
  });

  it("deletes a managed uploaded cover when deleting an article", async () => {
    Article.findByIdAndDelete.mockResolvedValue({
      _id: "article-1",
      coverImage: "/uploads/articles/old-cover.png",
    });

    await articleService.deleteArticle({ articleId: "article-1" });

    expect(deleteUploadByPublicPath).toHaveBeenCalledWith(
      "/uploads/articles/old-cover.png",
    );
  });

  it("uploads cover image to Cloudinary when cloud storage is enabled", async () => {
    isCloudinaryStorageEnabled.mockReturnValue(true);
    uploadArticleCoverImage.mockResolvedValue(
      "https://res.cloudinary.com/demo/image/upload/v123/atletikum/articles/new-cover.png",
    );
    Article.create.mockResolvedValue({
      _id: "article-1",
      coverImage:
        "https://res.cloudinary.com/demo/image/upload/v123/atletikum/articles/new-cover.png",
    });

    const file = {
      filename: "new-cover.png",
      path: "C:\\uploads\\articles\\new-cover.png",
    };

    await articleService.createArticle({
      payload: {
        title: "Article",
        summary: "Summary",
        content: "Content",
        tag: "TRAINING",
      },
      file,
    });

    expect(uploadArticleCoverImage).toHaveBeenCalledWith({ filePath: file.path });
    expect(Article.create).toHaveBeenCalledWith(
      expect.objectContaining({
        coverImage:
          "https://res.cloudinary.com/demo/image/upload/v123/atletikum/articles/new-cover.png",
      }),
    );
    expect(deleteUploadedRequestFile).toHaveBeenCalledWith(file);
  });
});
