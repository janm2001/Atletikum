const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Achievement } = require("../models/Achievement");

dotenv.config();

const achievements = [
  {
    key: "first-workout",
    title: "Prvi koraci",
    description: "Završi svoj prvi trening",
    xpReward: 50,
    xpCategory: "body",
    category: "milestone",
    trigger: "workout_count",
    threshold: 1,
    badgeIcon: "shoe",
  },
  {
    key: "first-quiz",
    title: "Znatiželjan um",
    description: "Riješi svoj prvi kviz",
    xpReward: 50,
    xpCategory: "brain",
    category: "milestone",
    trigger: "quiz_count",
    threshold: 1,
    badgeIcon: "brain",
  },
  {
    key: "xp-100",
    title: "Stotnjak",
    description: "Sakupi 100 XP ukupno",
    xpReward: 25,
    xpCategory: "both",
    category: "milestone",
    trigger: "xp_threshold",
    threshold: 100,
    badgeIcon: "star",
  },
  {
    key: "xp-500",
    title: "Pola tisućice",
    description: "Sakupi 500 XP ukupno",
    xpReward: 50,
    xpCategory: "both",
    category: "milestone",
    trigger: "xp_threshold",
    threshold: 500,
    badgeIcon: "flame",
  },
  {
    key: "xp-1000",
    title: "Tisućnjak",
    description: "Sakupi 1000 XP ukupno",
    xpReward: 100,
    xpCategory: "both",
    category: "milestone",
    trigger: "xp_threshold",
    threshold: 1000,
    badgeIcon: "diamond",
  },
  {
    key: "level-5",
    title: "Razina 5",
    description: "Dostavi razinu 5",
    xpReward: 75,
    xpCategory: "both",
    category: "milestone",
    trigger: "level",
    threshold: 5,
    badgeIcon: "trophy",
  },
  {
    key: "level-10",
    title: "Desetka",
    description: "Dostavi razinu 10",
    xpReward: 150,
    xpCategory: "both",
    category: "milestone",
    trigger: "level",
    threshold: 10,
    badgeIcon: "trophy",
  },
  {
    key: "level-25",
    title: "Veteran",
    description: "Dostavi razinu 25",
    xpReward: 300,
    xpCategory: "both",
    category: "milestone",
    trigger: "level",
    threshold: 25,
    badgeIcon: "medal",
  },
  {
    key: "level-50",
    title: "Legenda",
    description: "Dostavi razinu 50",
    xpReward: 1000,
    xpCategory: "both",
    category: "milestone",
    trigger: "level",
    threshold: 50,
    badgeIcon: "crown",
  },

  {
    key: "streak-3",
    title: "Tri dana zaredom",
    description: "Održi striku od 3 dana",
    xpReward: 30,
    xpCategory: "both",
    category: "consistency",
    trigger: "streak",
    threshold: 3,
    badgeIcon: "flame",
  },
  {
    key: "streak-7",
    title: "Ratnik tjedna",
    description: "Vježbaj 7 dana zaredom",
    xpReward: 100,
    xpCategory: "both",
    category: "consistency",
    trigger: "streak",
    threshold: 7,
    badgeIcon: "flame",
  },
  {
    key: "streak-30",
    title: "Kralj konzistencije",
    description: "Održi striku od 30 dana",
    xpReward: 500,
    xpCategory: "both",
    category: "consistency",
    trigger: "streak",
    threshold: 30,
    badgeIcon: "crown",
  },

  {
    key: "workout-5",
    title: "Redovit treniraš",
    description: "Završi 5 treninga",
    xpReward: 75,
    xpCategory: "body",
    category: "performance",
    trigger: "workout_count",
    threshold: 5,
    badgeIcon: "barbell",
  },
  {
    key: "workout-10",
    title: "Desetka treninga",
    description: "Završi 10 treninga",
    xpReward: 150,
    xpCategory: "body",
    category: "performance",
    trigger: "workout_count",
    threshold: 10,
    badgeIcon: "barbell",
  },
  {
    key: "workout-25",
    title: "Gospodar snage",
    description: "Završi 25 treninga",
    xpReward: 300,
    xpCategory: "body",
    category: "performance",
    trigger: "workout_count",
    threshold: 25,
    badgeIcon: "barbell",
  },
  {
    key: "quiz-3",
    title: "Učenik",
    description: "Riješi 3 kviza",
    xpReward: 50,
    xpCategory: "brain",
    category: "performance",
    trigger: "quiz_count",
    threshold: 3,
    badgeIcon: "book",
  },
  {
    key: "quiz-5",
    title: "Znalac",
    description: "Riješi 5 kvizova",
    xpReward: 100,
    xpCategory: "brain",
    category: "performance",
    trigger: "quiz_count",
    threshold: 5,
    badgeIcon: "book",
  },
  {
    key: "quiz-10",
    title: "Guru znanja",
    description: "Riješi 10 kvizova",
    xpReward: 200,
    xpCategory: "brain",
    category: "performance",
    trigger: "quiz_count",
    threshold: 10,
    badgeIcon: "brain",
  },
  {
    key: "perfect-quiz",
    title: "Savršen rezultat",
    description: "Ostvari savršen rezultat na kvizu",
    xpReward: 75,
    xpCategory: "brain",
    category: "performance",
    trigger: "perfect_quiz",
    threshold: 1,
    badgeIcon: "star",
  },

  {
    key: "same-day-both",
    title: "Tijelo i um",
    description: "Završi trening i kviz na isti dan",
    xpReward: 100,
    xpCategory: "both",
    category: "special",
    trigger: "same_day_both",
    threshold: 1,
    badgeIcon: "sparkles",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB povezan za seeding dostignuća...");

    if (process.argv.includes("--delete")) {
      await Achievement.deleteMany();
      console.log("Sva dostignuća obrisana.");
      process.exit(0);
    }

    await Achievement.deleteMany();
    const created = await Achievement.insertMany(achievements);
    console.log(`Uspješno uneseno ${created.length} dostignuća.`);
    process.exit(0);
  } catch (err) {
    console.error("Greška pri seedingu:", err);
    process.exit(1);
  }
};

seed();
