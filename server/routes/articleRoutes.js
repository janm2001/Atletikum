const express = require("express");
const articleController = require("../controllers/articleController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  articleMutationLimiter,
  articleUserMutationLimiter,
} = require("../middleware/rateLimiters");
const upload = require("../middleware/upload");
const {
  validateArticleIdRequest,
  validateUpdateReadingProgressRequest,
} = require("../validators/articleValidator");

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
  .post(
    articleUserMutationLimiter,
    validateArticleIdRequest,
    articleController.toggleBookmark,
  )
  .delete(
    articleUserMutationLimiter,
    validateArticleIdRequest,
    articleController.removeBookmark,
  );

router.patch(
  "/:id/progress",
  articleUserMutationLimiter,
  validateUpdateReadingProgressRequest,
  articleController.updateReadingProgress,
);

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
