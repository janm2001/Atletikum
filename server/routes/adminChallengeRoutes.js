const express = require("express");
const challengeTemplateController = require("../controllers/challengeTemplateController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router
  .route("/templates")
  .get(challengeTemplateController.getTemplates)
  .post(challengeTemplateController.createTemplate);

router.patch(
  "/templates/:templateId",
  challengeTemplateController.updateTemplate,
);

router.post(
  "/templates/publish",
  challengeTemplateController.publishTemplates,
);

module.exports = router;
