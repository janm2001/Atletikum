require("dotenv").config();
const mongoose = require("mongoose");
const { WeeklyChallenge } = require("../models/WeeklyChallenge");
const { getMongoUri } = require("../config/env");

const CHALLENGE_TEMPLATES = [
  {
    type: "quiz",
    targetCount: 3,
    xpReward: 100,
    description: "Complete 3 quizzes this week",
  },
  {
    type: "workout",
    targetCount: 2,
    xpReward: 150,
    description: "Log 2 workouts this week",
  },
  {
    type: "reading",
    targetCount: 5,
    xpReward: 75,
    description: "Read 5 articles this week",
  },
];

const startOfIsoWeek = (date) => {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const endOfIsoWeek = (weekStart) => {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + 6);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

const seed = async () => {
  await mongoose.connect(getMongoUri());
  console.log("MongoDB povezan!");

  const shouldDelete = process.argv.includes("--delete");

  const weekStart = startOfIsoWeek(new Date());
  const weekEnd = endOfIsoWeek(weekStart);

  if (shouldDelete) {
    const deleted = await WeeklyChallenge.deleteMany({ weekStart });
    console.log(`Obrisano ${deleted.deletedCount} izazova za ovaj tjedan.`);
  }

  const docs = CHALLENGE_TEMPLATES.map((template) => ({
    ...template,
    weekStart,
    weekEnd,
  }));

  for (const doc of docs) {
    await WeeklyChallenge.findOneAndUpdate(
      { type: doc.type, weekStart: doc.weekStart },
      doc,
      { upsert: true, runValidators: true },
    );
    console.log(`Upsert: ${doc.type} (${doc.targetCount} puta, ${doc.xpReward} XP)`);
  }

  console.log("Seeding tjednih izazova završeno.");
  await mongoose.connection.close();
};

seed().catch((err) => {
  console.error("Greška pri seedanju:", err);
  process.exit(1);
});
