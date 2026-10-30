const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { articleUserMutationLimiter } = require("../middleware/rateLimiters");
const learning = require("../services/learningService");

router.use(protect);
router.get("/", asyncHandler(async (req, res) => {
  res.json({ status: "success", data: await learning.getJourney({ userId: req.userId }) });
}));
router.post("/rest", articleUserMutationLimiter, asyncHandler(async (req, res) => {
  res.json({ status: "success", data: await learning.chooseRest({ userId: req.userId }) });
}));
router.post("/lessons/:lessonId/complete", articleUserMutationLimiter, asyncHandler(async (req, res) => {
  const result = await learning.completeLesson({
    userId: req.userId, lessonId: req.params.lessonId, answer: req.body?.answer,
  });
  res.json({ status: "success", data: result });
}));
module.exports = router;
