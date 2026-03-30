const express = require("express");
const activityController = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/feed", activityController.getFeed);
router.post("/:eventId/react", activityController.addReaction);
router.delete("/:eventId/react", activityController.removeReaction);

module.exports = router;
