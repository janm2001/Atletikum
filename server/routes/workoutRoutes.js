const express = require("express");
const workoutController = require("../controllers/workoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(workoutController.getAllWorkouts);

module.exports = router;
