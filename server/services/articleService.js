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

const ARTICLE_UPLOADS_PREFIX = "/uploads/articles/";
const ARTICLE_UPLOADS_MARKER = "uploads/articles/";
const ARTICLE_IMAGE_FILENAME_PATTERN =
  /^[^/\\]+\.(png|jpe?g|gif|webp|svg|avif)$/i;
const LOCAL_UPLOAD_HOSTS = new Set(["localhost", "127.0.0.1"]);

const isAbsoluteCoverImageUrl = (value) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("data:") ||
  value.startsWith("blob:") ||
  value.startsWith("//");

const parseAbsoluteCoverImageUrl = (value) => {
  try {
    return value.startsWith("//") ? new URL(`http:${value}`) : new URL(value);
  } catch {
    return null;
  }
};

const extractUploadsPublicPath = (value) => {
  const basePath = String(value).split(/[?#]/, 1)[0];
  const normalizedPath = basePath.replace(/\\/g, "/");
  const lowerNormalizedPath = normalizedPath.toLowerCase();
  const uploadsMarkerIndex = lowerNormalizedPath.indexOf(ARTICLE_UPLOADS_MARKER);

  if (uploadsMarkerIndex < 0) {
    return null;
  }

  const uploadsRelativePath = normalizedPath
    .slice(uploadsMarkerIndex)
    .replace(/^\/+/, "");

  return `/${uploadsRelativePath}`;
};

const normalizeManualCoverImagePath = (coverImage) => {
  if (typeof coverImage !== "string") {
    return coverImage;
  }

  const trimmedCoverImage = coverImage.trim();
  if (!trimmedCoverImage) {
    return "";
  }

  const lowerTrimmedCoverImage = trimmedCoverImage.toLowerCase();
  if (isAbsoluteCoverImageUrl(lowerTrimmedCoverImage)) {
    if (
      lowerTrimmedCoverImage.startsWith("data:") ||
      lowerTrimmedCoverImage.startsWith("blob:")
    ) {
      return trimmedCoverImage;
    }

    const parsedAbsoluteUrl = parseAbsoluteCoverImageUrl(trimmedCoverImage);
    if (!parsedAbsoluteUrl) {
      return trimmedCoverImage;
    }

    if (!LOCAL_UPLOAD_HOSTS.has(parsedAbsoluteUrl.hostname.toLowerCase())) {
      return trimmedCoverImage;
    }

    const uploadsPublicPath = extractUploadsPublicPath(parsedAbsoluteUrl.pathname);
    return uploadsPublicPath ?? trimmedCoverImage;
  }

  const uploadsPublicPath = extractUploadsPublicPath(trimmedCoverImage);
  if (uploadsPublicPath) {
    return uploadsPublicPath;
  }

  if (ARTICLE_IMAGE_FILENAME_PATTERN.test(trimmedCoverImage)) {
    return `${ARTICLE_UPLOADS_PREFIX}${trimmedCoverImage}`;
  }

  return trimmedCoverImage;
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
  normalized.relatedExerciseIds = (
    parseJsonArrayField(payload.relatedExerciseIds) ?? []
  )
    .filter(Boolean)
    .map((item) => String(item));
  if (Object.prototype.hasOwnProperty.call(payload, "coverImage")) {
    normalized.coverImage = normalizeManualCoverImagePath(payload.coverImage);
  }

  return normalized;
};

const buildArticleCoverImagePath = (file) =>
  file ? `/uploads/articles/${file.filename}` : null;

const getRelatedExercises = async (relatedExerciseIds) => {
  if (!Array.isArray(relatedExerciseIds) || relatedExerciseIds.length === 0) {
    return [];
  }

  const exercises = await Exercise.find({
    _id: { $in: relatedExerciseIds },
  }).lean();
  const exerciseMap = new Map(
    exercises.map((exercise) => [String(exercise._id), exercise]),
  );

  return relatedExerciseIds
    .map((exerciseId) => exerciseMap.get(String(exerciseId)))
    .filter(Boolean);
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
  const relatedExercises = await getRelatedExercises(
    article.relatedExerciseIds,
  );

  return {
    ...article,
    bookmark: bookmarkMap.get(String(article._id)) ?? normalizeBookmarkState(),
    relatedArticles: attachBookmarkState(relatedArticles, bookmarkMap),
    relatedExercises,
  };
};

const createArticle = async ({ payload, file }) => {
  const articleData = normalizeArticlePayload(payload);
  const useCloudinaryStorage = isCloudinaryStorageEnabled();
  let uploadedCoverImage = null;

  if (file) {
    if (useCloudinaryStorage) {
      uploadedCoverImage = await uploadArticleCoverImage({ filePath: file.path });
      articleData.coverImage = uploadedCoverImage;
      await deleteUploadedRequestFile(file);
    } else {
      articleData.coverImage = buildArticleCoverImagePath(file);
    }
  }

  try {
    return await Article.create(articleData);
  } catch (error) {
    if (uploadedCoverImage) {
      await deleteUploadByPublicPath(uploadedCoverImage);
    }
    await deleteUploadedRequestFile(file);
    throw error;
  }
};

const updateArticle = async ({ articleId, payload, file }) => {
  const existingArticle = await Article.findById(articleId);
  if (!existingArticle) {
    await deleteUploadedRequestFile(file);
    throw new AppError("Članak nije pronađen", 404);
  }

  const updateData = normalizeArticlePayload(payload);
  const useCloudinaryStorage = isCloudinaryStorageEnabled();
  let uploadedCoverImage = null;

  if (file) {
    if (useCloudinaryStorage) {
      uploadedCoverImage = await uploadArticleCoverImage({ filePath: file.path });
      updateData.coverImage = uploadedCoverImage;
      await deleteUploadedRequestFile(file);
    } else {
      updateData.coverImage = buildArticleCoverImagePath(file);
    }
  }

  try {
    const article = await Article.findByIdAndUpdate(articleId, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!article) {
      await deleteUploadedRequestFile(file);
      throw new AppError("Članak nije pronađen", 404);
    }

    if (
      existingArticle.coverImage &&
      existingArticle.coverImage !== article.coverImage
    ) {
      await deleteUploadByPublicPath(existingArticle.coverImage);
    }

    return article;
  } catch (error) {
    if (uploadedCoverImage) {
      await deleteUploadByPublicPath(uploadedCoverImage);
    }
    await deleteUploadedRequestFile(file);
    throw error;
  }
};

const deleteArticle = async ({ articleId }) => {
  const article = await Article.findByIdAndDelete(articleId);
  if (!article) {
    throw new AppError("Članak nije pronađen", 404);
  }

  await deleteUploadByPublicPath(article.coverImage);
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
    { returnDocument: "after", upsert: true, runValidators: true },
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
    { returnDocument: "after", upsert: true, runValidators: true },
  ).lean();

  return normalizeBookmarkState(bookmark);
};

module.exports = {
  normalizeBookmarkState,
  getBookmarkMap,
  attachBookmarkState,
  normalizeManualCoverImagePath,
  normalizeArticlePayload,
  getRelatedExercises,
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleBookmark,
  updateReadingProgress,
};
