const express = require("express");
const articleController = require("../controllers/articleController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(articleController.getAllArticles)
  .post(articleController.createArticle);

router
  .route("/:id")
  .get(articleController.getArticleById)
  .patch(articleController.updateArticle)
  .delete(articleController.deleteArticle);

module.exports = router;
