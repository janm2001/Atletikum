const express = require("express");
const articleController = require("../controllers/articleController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(articleController.getAllArticles)
  .post(restrictTo("admin"), articleController.createArticle);

router
  .route("/:id")
  .get(articleController.getArticleById)
  .patch(restrictTo("admin"), articleController.updateArticle)
  .delete(restrictTo("admin"), articleController.deleteArticle);

module.exports = router;
