const { Article } = require("../models/Article");
const { ArticleBookmark } = require("../models/ArticleBookmark");

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

exports.getAllArticles = async (req, res) => {
  try {
    const filter = {};
    const savedOnly = req.query.saved === "true";

    if (req.query.tag) {
      if (Array.isArray(req.query.tag)) {
        filter.tag = { $in: req.query.tag };
      } else {
        filter.tag = req.query.tag;
      }
    }

    if (savedOnly) {
      const savedBookmarks = await ArticleBookmark.find({
        user: req.user._id.toString(),
        isBookmarked: true,
      })
        .select("article")
        .lean();

      const savedIds = savedBookmarks.map((bookmark) => bookmark.article);

      if (savedIds.length === 0) {
        return res.status(200).json({
          status: "success",
          results: 0,
          data: { articles: [] },
        });
      }

      filter._id = { $in: savedIds };
    }

    const articles = await Article.find(filter)
      .select("-quiz")
      .sort({ createdAt: -1 })
      .lean();

    const bookmarkMap = await getBookmarkMap(
      req.user._id.toString(),
      articles.map((article) => article._id),
    );
    const enrichedArticles = attachBookmarkState(articles, bookmarkMap);

    res.status(200).json({
      status: "success",
      results: enrichedArticles.length,
      data: { articles: enrichedArticles },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) {
      return res
        .status(404)
        .json({ status: "fail", message: "Članak nije pronađen" });
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

    const bookmarkMap = await getBookmarkMap(req.user._id.toString(), [
      article._id,
      ...relatedArticles.map((relatedArticle) => relatedArticle._id),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        article: {
          ...article,
          bookmark:
            bookmarkMap.get(String(article._id)) ?? normalizeBookmarkState(),
          relatedArticles: attachBookmarkState(relatedArticles, bookmarkMap),
        },
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const articleData = normalizeArticlePayload(req.body);

    if (req.file) {
      articleData.coverImage = `/uploads/articles/${req.file.filename}`;
    }

    const newArticle = await Article.create(articleData);
    res.status(201).json({ status: "success", data: { article: newArticle } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const updateData = normalizeArticlePayload(req.body);

    if (req.file) {
      updateData.coverImage = `/uploads/articles/${req.file.filename}`;
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );
    if (!updatedArticle) {
      return res
        .status(404)
        .json({ status: "fail", message: "Članak nije pronađen" });
    }
    res
      .status(200)
      .json({ status: "success", data: { article: updatedArticle } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const deletedArticle = await Article.findByIdAndDelete(req.params.id);
    if (!deletedArticle) {
      return res
        .status(404)
        .json({ status: "fail", message: "Članak nije pronađen" });
    }
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const bookmark = await ArticleBookmark.findOneAndUpdate(
      {
        user: req.user._id.toString(),
        article: req.params.id,
      },
      {
        $set: {
          isBookmarked: true,
          savedAt: new Date(),
        },
        $setOnInsert: {
          progressPercent: 0,
          isCompleted: false,
        },
      },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    res.status(200).json({
      status: "success",
      data: { bookmark: normalizeBookmarkState(bookmark) },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const bookmark = await ArticleBookmark.findOneAndUpdate(
      {
        user: req.user._id.toString(),
        article: req.params.id,
      },
      {
        $set: {
          isBookmarked: false,
          savedAt: null,
        },
      },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    res.status(200).json({
      status: "success",
      data: { bookmark: normalizeBookmarkState(bookmark) },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateReadingProgress = async (req, res) => {
  try {
    const progressPercent = Math.max(
      0,
      Math.min(100, Number(req.body.progressPercent ?? 0)),
    );
    const isCompleted = progressPercent >= 100 || Boolean(req.body.isCompleted);

    const bookmark = await ArticleBookmark.findOneAndUpdate(
      {
        user: req.user._id.toString(),
        article: req.params.id,
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

    res.status(200).json({
      status: "success",
      data: { bookmark: normalizeBookmarkState(bookmark) },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
