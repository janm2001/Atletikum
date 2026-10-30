const { LearningJourney } = require("../models/LearningJourney");
const { lessons, publicLessons } = require("../content/movementLessons");
const AppError = require("../utils/AppError");
const { requireUserId } = require("../utils/userIdentity");

// Product calendar is Croatian; never use the database host's timezone.
const learningDay = (now = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Zagreb", year: "numeric", month: "2-digit", day: "2-digit",
}).format(now);

const serializeJourney = (journey, now) => ({
  lessons: publicLessons(),
  completedLessonIds: journey?.completedLessonIds ?? [],
  today: learningDay(now),
  learnedToday: journey?.lastLearningDay === learningDay(now),
  restingToday: journey?.restDay === learningDay(now),
});

const getJourney = async ({ userId, now = new Date() }) => {
  const journey = await LearningJourney.findOne({ user: requireUserId({ userId }) }).lean();
  return serializeJourney(journey, now);
};

// Atomic, repeatable writes: retries cannot duplicate skills or award workout XP.
const updateJourney = async (userId, update) => {
  const filter = { user: requireUserId({ userId }) };
  try {
    return await LearningJourney.findOneAndUpdate(filter, update, {
      upsert: true, returnDocument: "after", runValidators: true,
    }).lean();
  } catch (error) {
    if (error.code !== 11000) throw error;
    return LearningJourney.findOneAndUpdate(filter, update, {
      returnDocument: "after", runValidators: true,
    }).lean();
  }
};

const completeLesson = async ({ userId, lessonId, answer, now = new Date() }) => {
  const lesson = lessons.find((entry) => entry.id === lessonId);
  if (!lesson) throw new AppError("Lekcija nije pronađena.", 404);
  if (!Number.isInteger(answer) || answer < 0 || answer >= lesson.options.length) {
    throw new AppError("Odaberi jedan od ponuđenih odgovora.", 400);
  }
  if (answer !== lesson.correctIndex) {
    return { correct: false, explanation: lesson.explanation };
  }
  const journey = await updateJourney(userId, {
    $addToSet: { completedLessonIds: lesson.id },
    $set: { lastLearningDay: learningDay(now) },
  });
  return { correct: true, explanation: lesson.explanation, journey: serializeJourney(journey, now) };
};

const chooseRest = async ({ userId, now = new Date() }) => {
  const journey = await updateJourney(userId, { $set: { restDay: learningDay(now) } });
  return serializeJourney(journey, now);
};

module.exports = { learningDay, getJourney, completeLesson, chooseRest };
