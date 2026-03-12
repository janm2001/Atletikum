const express = require("express");
const articleController = require("../controllers/articleController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { articleMutationLimiter } = require("../middleware/rateLimiters");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(articleController.getAllArticles)
  .post(
    restrictTo("admin"),
    articleMutationLimiter,
    upload.single("thumbnail"),
    articleController.createArticle,
  );

router
  .route("/:id/bookmark")
  .post(articleController.toggleBookmark)
  .delete(articleController.removeBookmark);

router.patch("/:id/progress", articleController.updateReadingProgress);

router
  .route("/:id")
  .get(articleController.getArticleById)
  .patch(
    restrictTo("admin"),
    articleMutationLimiter,
    upload.single("thumbnail"),
    articleController.updateArticle,
  )
  .delete(
    restrictTo("admin"),
    articleMutationLimiter,
    articleController.deleteArticle,
  );

module.exports = router;
