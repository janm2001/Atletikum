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
const validate = require("../middleware/validate");

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
    validate(validateArticleIdRequest),
    articleController.toggleBookmark,
  )
  .delete(
    articleUserMutationLimiter,
    validate(validateArticleIdRequest),
    articleController.removeBookmark,
  );

router.patch(
  "/:id/progress",
  articleUserMutationLimiter,
  validate(validateUpdateReadingProgressRequest),
  articleController.updateReadingProgress,
);

router
  .route("/:id")
  .get(articleController.getArticleById)
  .patch(
    restrictTo("admin"),
    articleMutationLimiter,
    upload.single("thumbnail"),
    validate(validateArticleIdRequest),
    articleController.updateArticle,
  )
  .delete(
    restrictTo("admin"),
    articleMutationLimiter,
    validate(validateArticleIdRequest),
    articleController.deleteArticle,
  );

module.exports = router;
