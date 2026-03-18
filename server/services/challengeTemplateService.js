const mongoose = require("mongoose");
const { ChallengeTemplate } = require("../models/ChallengeTemplate");
const { WeeklyChallenge } = require("../models/WeeklyChallenge");
const { startOfIsoWeek, endOfIsoWeek } = require("./weeklyChallengeService");
const AppError = require("../utils/AppError");

const VALID_TYPES = ["quiz", "workout", "reading", "custom"];

const validateTemplatePayload = ({
  type,
  targetCount,
  xpReward,
  description,
}) => {
  const errors = [];

  if (type && !VALID_TYPES.includes(type)) {
    errors.push(`type mora biti jedan od: ${VALID_TYPES.join(", ")}`);
  }
  if (targetCount !== undefined && (!Number.isInteger(targetCount) || targetCount < 1)) {
    errors.push("targetCount mora biti cijeli broj >= 1");
  }
  if (xpReward !== undefined && (!Number.isInteger(xpReward) || xpReward < 1)) {
    errors.push("xpReward mora biti cijeli broj >= 1");
  }
  if (description !== undefined && (typeof description !== "string" || description.length < 1 || description.length > 180)) {
    errors.push("description mora biti tekst duljine 1-180 znakova");
  }

  return errors;
};

const getTemplates = async ({ enabled } = {}) => {
  const filter = {};
  if (enabled !== undefined) {
    filter.enabled = enabled;
  }

  const templates = await ChallengeTemplate.find(filter)
    .sort({ type: 1, createdAt: -1 })
    .lean();

  return templates.map(formatTemplate);
};

const createTemplate = async ({ type, targetCount, xpReward, description, enabled = true }) => {
  const errors = validateTemplatePayload({ type, targetCount, xpReward, description });
  if (!type || !targetCount || !xpReward || !description) {
    errors.push("Sva obavezna polja moraju biti popunjena.");
  }
  if (errors.length > 0) {
    throw new AppError("Podaci predloška nisu ispravni.", 400);
  }

  const template = await ChallengeTemplate.create({
    type,
    targetCount,
    xpReward,
    description,
    enabled,
  });

  return formatTemplate(template.toObject());
};

const updateTemplate = async ({ templateId, updates }) => {
  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw new AppError("Neispravan identifikator predloška.", 400);
  }

  const allowedFields = ["type", "targetCount", "xpReward", "description", "enabled"];
  const sanitized = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitized[key] = updates[key];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new AppError("Podaci predloška nisu ispravni.", 400);
  }

  const errors = validateTemplatePayload(sanitized);
  if (errors.length > 0) {
    throw new AppError("Podaci predloška nisu ispravni.", 400);
  }

  const template = await ChallengeTemplate.findByIdAndUpdate(
    templateId,
    { $set: sanitized },
    { new: true, runValidators: true },
  ).lean();

  if (!template) {
    throw new AppError("Predložak izazova nije pronađen.", 404);
  }

  return formatTemplate(template);
};

const publishTemplates = async ({ effectiveFromWeekStart }) => {
  if (!effectiveFromWeekStart) {
    throw new AppError("Podaci predloška nisu ispravni.", 400);
  }

  const weekStart = startOfIsoWeek(new Date(effectiveFromWeekStart));
  const weekEnd = endOfIsoWeek(weekStart);
  const now = new Date();
  const currentWeekStart = startOfIsoWeek(now);

  if (weekStart.getTime() <= currentWeekStart.getTime()) {
    throw new AppError("Podaci predloška nisu ispravni.", 400);
  }

  const enabledTemplates = await ChallengeTemplate.find({ enabled: true }).lean();

  if (enabledTemplates.length === 0) {
    throw new AppError("Podaci predloška nisu ispravni.", 400);
  }

  const existingForWeek = await WeeklyChallenge.find({ weekStart }).lean();
  const existingTypes = new Set(existingForWeek.map((c) => c.type));

  const typesSeen = new Set();
  const toCreate = [];

  for (const tmpl of enabledTemplates) {
    if (existingTypes.has(tmpl.type) || typesSeen.has(tmpl.type)) {
      continue;
    }
    typesSeen.add(tmpl.type);

    toCreate.push({
      type: tmpl.type,
      targetCount: tmpl.targetCount,
      xpReward: tmpl.xpReward,
      description: tmpl.description,
      weekStart,
      weekEnd,
    });
  }

  if (toCreate.length === 0 && existingForWeek.length > 0) {
    throw new AppError(
      "Postoji preklapanje vremenskog raspona za isti tip predloška.",
      409,
    );
  }

  if (toCreate.length > 0) {
    await WeeklyChallenge.insertMany(toCreate, { ordered: false }).catch(
      (err) => {
        if (
          err?.code !== 11000 &&
          !err?.writeErrors?.every?.((e) => e?.code === 11000)
        ) {
          throw err;
        }
      },
    );
  }

  const publishedAt = new Date();
  await ChallengeTemplate.updateMany(
    { _id: { $in: enabledTemplates.map((t) => t._id) } },
    {
      $set: {
        effectiveFromWeekStart: weekStart,
        publishedAt,
      },
      $inc: { version: 1 },
    },
  );

  const updatedTemplates = await ChallengeTemplate.find({
    _id: { $in: enabledTemplates.map((t) => t._id) },
  }).lean();

  return {
    published: updatedTemplates.map(formatTemplate),
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
  };
};

const formatTemplate = (tmpl) => ({
  id: String(tmpl._id),
  version: tmpl.version,
  type: tmpl.type,
  targetCount: tmpl.targetCount,
  xpReward: tmpl.xpReward,
  description: tmpl.description,
  enabled: tmpl.enabled,
  effectiveFromWeekStart: tmpl.effectiveFromWeekStart
    ? tmpl.effectiveFromWeekStart.toISOString?.() ?? tmpl.effectiveFromWeekStart
    : null,
  effectiveToWeekStart: tmpl.effectiveToWeekStart
    ? tmpl.effectiveToWeekStart.toISOString?.() ?? tmpl.effectiveToWeekStart
    : null,
  createdAt: tmpl.createdAt,
  updatedAt: tmpl.updatedAt,
});

module.exports = {
  getTemplates,
  createTemplate,
  updateTemplate,
  publishTemplates,
};
