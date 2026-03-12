const asyncHandler = require("../middleware/asyncHandler");
const articleService = require("../services/articleService");

exports.getAllArticles = asyncHandler(async (req, res) => {
  const articles = await articleService.getAllArticles({
    userId: req.userId,
    query: req.query,
  });

  res.status(200).json({
    status: "success",
    results: articles.length,
    data: { articles },
  });
});

exports.getArticleById = asyncHandler(async (req, res) => {
  const article = await articleService.getArticleById({
    articleId: req.params.id,
    userId: req.userId,
  });

  res.status(200).json({
    status: "success",
    data: { article },
  });
});

exports.createArticle = asyncHandler(async (req, res) => {
  const article = await articleService.createArticle({
    payload: req.body,
    file: req.file,
  });

  res.status(201).json({ status: "success", data: { article } });
});

exports.updateArticle = asyncHandler(async (req, res) => {
  const article = await articleService.updateArticle({
    articleId: req.params.id,
    payload: req.body,
    file: req.file,
  });

  res.status(200).json({ status: "success", data: { article } });
});

exports.deleteArticle = asyncHandler(async (req, res) => {
  await articleService.deleteArticle({ articleId: req.params.id });
  res.status(204).json({ status: "success", data: null });
});

exports.toggleBookmark = asyncHandler(async (req, res) => {
  const bookmark = await articleService.toggleBookmark({
    userId: req.userId,
    articleId: req.params.id,
    shouldBookmark: true,
  });

  res.status(200).json({
    status: "success",
    data: { bookmark },
  });
});

exports.removeBookmark = asyncHandler(async (req, res) => {
  const bookmark = await articleService.toggleBookmark({
    userId: req.userId,
    articleId: req.params.id,
    shouldBookmark: false,
  });

  res.status(200).json({
    status: "success",
    data: { bookmark },
  });
});

exports.updateReadingProgress = asyncHandler(async (req, res) => {
  const bookmark = await articleService.updateReadingProgress({
    userId: req.userId,
    articleId: req.params.id,
    payload: req.body,
  });

  res.status(200).json({
    status: "success",
    data: { bookmark },
  });
});
