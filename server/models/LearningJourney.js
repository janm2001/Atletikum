const mongoose = require("mongoose");
const { lessons } = require("../content/movementLessons");

const learningJourneySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  completedLessonIds: [{ type: String, enum: lessons.map((lesson) => lesson.id) }],
  lastLearningDay: { type: String, default: null },
  restDay: { type: String, default: null },
}, { timestamps: true });

module.exports = { LearningJourney: mongoose.model("LearningJourney", learningJourneySchema) };
