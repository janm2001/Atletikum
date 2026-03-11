const { Article } = require("../models/Article");
const { ArticleBookmark } = require("../models/ArticleBookmark");
const AppError = require("../utils/AppError");

const normalizeBookmarkState = (bookmark) => ({
  isBookmarked: Boolean(bookmark?.isBookmarked),
  progressPercent: Number(bookmark?.progressPercent ?? 0),
  isCompleted: Boolean(bookmark?.isCompleted),
  savedAt: bookmark?.savedAt ?? null,
  lastViewedAt: bookmark?.lastViewedAt ?? null,
});

const getBookmarkMap = async (userId, articleIds) => {
  if (!articleIds || articleIds.length === 0) {
    return new Map();
  }

  const bookmarks = await ArticleBookmark.find({
    user: userId,
    article: { $in: articleIds },
  }).lean();

  return new Map(
    bookmarks.map((bookmark) => [
      String(bookmark.article),
      normalizeBookmarkState(bookmark),
    ]),
  );
};

const attachBookmarkState = (articles, bookmarkMap) =>
  articles.map((article) => ({
    ...article,
    bookmark: bookmarkMap.get(String(article._id)) ?? normalizeBookmarkState(),
  }));

const parseJsonArrayField = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeArticlePayload = (payload) => {
  const normalized = { ...payload };
  normalized.quiz = parseJsonArrayField(payload.quiz) ?? [];
  normalized.actionSummary = (parseJsonArrayField(payload.actionSummary) ?? [])
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);
  normalized.relatedArticleIds = (
    parseJsonArrayField(payload.relatedArticleIds) ?? []
  )
    .filter(Boolean)
    .map((item) => String(item));

  return normalized;
};

const buildArticleFilter = async ({ userId, query }) => {
  const filter = {};
  const savedOnly = query.saved === "true";

  if (query.tag) {
    filter.tag = Array.isArray(query.tag) ? { $in: query.tag } : query.tag;
  }

  if (!savedOnly) {
    return filter;
  }

  const savedBookmarks = await ArticleBookmark.find({
    user: userId,
    isBookmarked: true,
  })
    .select("article")
    .lean();

  const savedIds = savedBookmarks.map((bookmark) => bookmark.article);
  if (savedIds.length === 0) {
    return null;
  }

  filter._id = { $in: savedIds };
  return filter;
};

const getAllArticles = async ({ userId, query }) => {
  const filter = await buildArticleFilter({ userId, query });
  if (filter === null) {
    return [];
  }

  const articles = await Article.find(filter)
    .select("-quiz")
    .sort({ createdAt: -1 })
    .lean();

  const bookmarkMap = await getBookmarkMap(
    userId,
    articles.map((article) => article._id),
  );

  return attachBookmarkState(articles, bookmarkMap);
};

const getArticleById = async ({ articleId, userId }) => {
  const article = await Article.findById(articleId).lean();
  if (!article) {
    throw new AppError("Članak nije pronađen", 404);
  }

  const relatedIds =
    Array.isArray(article.relatedArticleIds) &&
    article.relatedArticleIds.length > 0
      ? article.relatedArticleIds
      : [];

  let relatedArticles = [];
  if (relatedIds.length > 0) {
    relatedArticles = await Article.find({
      _id: {
        $in: relatedIds.filter((id) => String(id) !== String(article._id)),
      },
    })
      .select("-quiz")
      .lean();
  }

  if (relatedArticles.length === 0) {
    relatedArticles = await Article.find({
      tag: article.tag,
      _id: { $ne: article._id },
    })
      .select("-quiz")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
  }

  const bookmarkMap = await getBookmarkMap(userId, [
    article._id,
    ...relatedArticles.map((relatedArticle) => relatedArticle._id),
  ]);

  return {
    ...article,
    bookmark: bookmarkMap.get(String(article._id)) ?? normalizeBookmarkState(),
    relatedArticles: attachBookmarkState(relatedArticles, bookmarkMap),
  };
};

const createArticle = async ({ payload, file }) => {
  const articleData = normalizeArticlePayload(payload);
  if (file) {
    articleData.coverImage = `/uploads/articles/${file.filename}`;
  }

  return Article.create(articleData);
};

const updateArticle = async ({ articleId, payload, file }) => {
  const updateData = normalizeArticlePayload(payload);
  if (file) {
    updateData.coverImage = `/uploads/articles/${file.filename}`;
  }

  const article = await Article.findByIdAndUpdate(articleId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!article) {
    throw new AppError("Članak nije pronađen", 404);
  }

  return article;
};

const deleteArticle = async ({ articleId }) => {
  const article = await Article.findByIdAndDelete(articleId);
  if (!article) {
    throw new AppError("Članak nije pronađen", 404);
  }
};

const toggleBookmark = async ({ userId, articleId, shouldBookmark }) => {
  const bookmark = await ArticleBookmark.findOneAndUpdate(
    {
      user: userId,
      article: articleId,
    },
    shouldBookmark
      ? {
          $set: {
            isBookmarked: true,
            savedAt: new Date(),
          },
          $setOnInsert: {
            progressPercent: 0,
            isCompleted: false,
          },
        }
      : {
          $set: {
            isBookmarked: false,
            savedAt: null,
          },
        },
    { new: true, upsert: true, runValidators: true },
  ).lean();

  return normalizeBookmarkState(bookmark);
};

const updateReadingProgress = async ({ userId, articleId, payload }) => {
  const progressPercent = Math.max(
    0,
    Math.min(100, Number(payload.progressPercent ?? 0)),
  );
  const isCompleted = progressPercent >= 100 || Boolean(payload.isCompleted);

  const bookmark = await ArticleBookmark.findOneAndUpdate(
    {
      user: userId,
      article: articleId,
    },
    {
      $set: {
        progressPercent,
        isCompleted,
        lastViewedAt: new Date(),
      },
      $setOnInsert: {
        isBookmarked: false,
        savedAt: null,
      },
    },
    { new: true, upsert: true, runValidators: true },
  ).lean();

  return normalizeBookmarkState(bookmark);
};

module.exports = {
  normalizeBookmarkState,
  getBookmarkMap,
  attachBookmarkState,
  normalizeArticlePayload,
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleBookmark,
  updateReadingProgress,
};
