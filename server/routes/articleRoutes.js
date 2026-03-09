const express = require("express");
const articleController = require("../controllers/articleController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(articleController.getAllArticles)
  .post(
    restrictTo("admin"),
    upload.single("thumbnail"),
    articleController.createArticle,
  );

router
  .route("/:id")
  .get(articleController.getArticleById)
  .patch(
    restrictTo("admin"),
    upload.single("thumbnail"),
    articleController.updateArticle,
  )
  .delete(restrictTo("admin"), articleController.deleteArticle);

module.exports = router;
