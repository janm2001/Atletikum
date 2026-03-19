const express = require("express");
const challengeTemplateController = require("../controllers/challengeTemplateController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  validateCreateTemplateRequest,
  validateUpdateTemplateRequest,
  validatePublishTemplatesRequest,
} = require("../validators/challengeValidator");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router
  .route("/templates")
  .get(challengeTemplateController.getTemplates)
  .post(validate(validateCreateTemplateRequest), challengeTemplateController.createTemplate);

router.patch(
  "/templates/:templateId",
  validate(validateUpdateTemplateRequest),
  challengeTemplateController.updateTemplate,
);

router.post(
  "/templates/publish",
  validate(validatePublishTemplatesRequest),
  challengeTemplateController.publishTemplates,
);

module.exports = router;
