const asyncHandler = require("../middleware/asyncHandler");
const challengeTemplateService = require("../services/challengeTemplateService");

exports.getTemplates = asyncHandler(async (req, res) => {
  const enabled =
    req.query.enabled === "true"
      ? true
      : req.query.enabled === "false"
        ? false
        : undefined;

  const templates = await challengeTemplateService.getTemplates({ enabled });

  res.status(200).json({
    status: "success",
    data: { templates },
  });
});

exports.createTemplate = asyncHandler(async (req, res) => {
  const template = await challengeTemplateService.createTemplate({
    type: req.body.type,
    targetCount: req.body.targetCount,
    xpReward: req.body.xpReward,
    description: req.body.description,
    enabled: req.body.enabled,
  });

  res.status(201).json({
    status: "success",
    data: { template },
  });
});

exports.updateTemplate = asyncHandler(async (req, res) => {
  const template = await challengeTemplateService.updateTemplate({
    templateId: req.params.templateId,
    updates: req.body,
  });

  res.status(200).json({
    status: "success",
    data: { template },
  });
});

exports.publishTemplates = asyncHandler(async (req, res) => {
  const result = await challengeTemplateService.publishTemplates({
    effectiveFromWeekStart: req.body.effectiveFromWeekStart,
  });

  res.status(200).json({
    status: "success",
    data: result,
  });
});
