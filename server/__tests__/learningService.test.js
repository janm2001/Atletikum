jest.mock("../models/LearningJourney", () => ({ LearningJourney: { findOne: jest.fn(), findOneAndUpdate: jest.fn() } }));
const { LearningJourney } = require("../models/LearningJourney");
const { learningDay, getJourney, completeLesson, chooseRest } = require("../services/learningService");
const { publicLessons } = require("../content/movementLessons");
const now = new Date("2026-10-30T12:00:00Z");
const lean = (value) => ({ lean: jest.fn().mockResolvedValue(value) });

beforeEach(() => jest.clearAllMocks());

test("learning day respects Zagreb midnight and daylight saving", () => {
  expect(learningDay(new Date("2026-10-30T23:30:00Z"))).toBe("2026-10-31");
  expect(learningDay(new Date("2026-07-01T22:30:00Z"))).toBe("2026-07-02");
});

test("new users have an empty journey and do not receive answer keys", async () => {
  LearningJourney.findOne.mockReturnValue(lean(null));
  const result = await getJourney({ userId: "user-1", now });
  expect(LearningJourney.findOne).toHaveBeenCalledWith({ user: "user-1" });
  expect(result).toMatchObject({ completedLessonIds: [], learnedToday: false, restingToday: false });
  expect(publicLessons().every((lesson) => lesson.correctIndex === undefined)).toBe(true);
});

test("wrong answers give feedback without storing progress", async () => {
  const result = await completeLesson({ userId: "user-1", lessonId: "sjedni-ustani", answer: 0, now });
  expect(result.correct).toBe(false);
  expect(LearningJourney.findOneAndUpdate).not.toHaveBeenCalled();
});

test.each([undefined, null, "1", -1, 1.5, 3, {}, [1]])("rejects malformed answer %p", async (answer) => {
  await expect(completeLesson({ userId: "user-1", lessonId: "sjedni-ustani", answer, now })).rejects.toMatchObject({ statusCode: 400 });
});

test("unknown lesson cannot create progress", async () => {
  await expect(completeLesson({ userId: "user-1", lessonId: "unknown", answer: 0, now })).rejects.toMatchObject({ statusCode: 404 });
});

test("completion is user-scoped and deduplicated, with no exercise or XP mutation", async () => {
  LearningJourney.findOneAndUpdate.mockReturnValue(lean({ completedLessonIds: ["sjedni-ustani"], lastLearningDay: "2026-10-30" }));
  const result = await completeLesson({ userId: "user-1", lessonId: "sjedni-ustani", answer: 1, now });
  expect(result.correct).toBe(true);
  expect(result.journey.learnedToday).toBe(true);
  expect(LearningJourney.findOneAndUpdate).toHaveBeenCalledWith({ user: "user-1" }, {
    $addToSet: { completedLessonIds: "sjedni-ustani" }, $set: { lastLearningDay: "2026-10-30" },
  }, { upsert: true, returnDocument: "after", runValidators: true });
});

test("rest and skipped days preserve previously learned lessons", async () => {
  const saved = { completedLessonIds: ["sjedni-ustani"], lastLearningDay: "2026-10-29", restDay: "2026-10-30" };
  LearningJourney.findOneAndUpdate.mockReturnValue(lean(saved));
  expect(await chooseRest({ userId: "user-1", now })).toMatchObject({ restingToday: true, completedLessonIds: ["sjedni-ustani"] });
  expect(LearningJourney.findOneAndUpdate.mock.calls[0][1]).toEqual({ $set: { restDay: "2026-10-30" } });
  LearningJourney.findOne.mockReturnValue(lean(saved));
  expect(await getJourney({ userId: "user-1", now: new Date("2026-11-10T12:00:00Z") })).toMatchObject({ restingToday: false, learnedToday: false, completedLessonIds: ["sjedni-ustani"] });
});

test("concurrent first writes recover from a unique user conflict", async () => {
  LearningJourney.findOneAndUpdate.mockReturnValueOnce({ lean: () => Promise.reject({ code: 11000 }) }).mockReturnValueOnce(lean({ completedLessonIds: [], restDay: "2026-10-30" }));
  expect((await chooseRest({ userId: "user-1", now })).restingToday).toBe(true);
  expect(LearningJourney.findOneAndUpdate.mock.calls[1][2].upsert).toBeUndefined();
});

test("storage errors remain errors rather than reporting success", async () => {
  LearningJourney.findOneAndUpdate.mockReturnValue({ lean: () => Promise.reject(new Error("offline")) });
  await expect(chooseRest({ userId: "user-1", now })).rejects.toThrow("offline");
});
