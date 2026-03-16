require("dotenv").config();
const mongoose = require("mongoose");
const { Workout } = require("../models/Workout");
const { Exercise } = require("../models/Exercise");

const workoutBlueprints = [
  {
    title: "Razina 1: Atletske Temelje",
    description:
      "Osnovna mehanika trčanja, kontrola trupa i temeljna snaga donjih ekstremiteta.",
    requiredLevel: 1,
    tags: ["SPEED", "CORE", "STRENGTH"],
    exercises: [
      { title: "A-preskoci", sets: 3, reps: "20m", rpe: "6", baseXp: 20 },
      { title: "Visoka koljena", sets: 3, reps: "20m", rpe: "6", baseXp: 18 },
      { title: "Most za gluteuse", sets: 3, reps: "12", rpe: "6", baseXp: 16 },
      { title: "Plank", sets: 3, reps: "30s", rpe: "6", baseXp: 16 },
      { title: "Podizanje na prste", sets: 3, reps: "15", rpe: "6", baseXp: 15 },
      { title: "Ptica i pas", sets: 3, reps: "10/str", rpe: "5", baseXp: 14 },
    ],
  },
  {
    title: "Razina 3: Snaga i Koordinacija",
    description:
      "Napredna pliometrija i unilateralna kontrola za izgradnju atletske eksplozivnosti.",
    requiredLevel: 3,
    tags: ["PLYOMETRICS", "STRENGTH", "CORE"],
    exercises: [
      { title: "B-preskoci", sets: 3, reps: "20m", rpe: "7", baseXp: 24 },
      { title: "Skokovi na kutiju", sets: 4, reps: "6", rpe: "7", baseXp: 26 },
      { title: "Iskoraci u hodu", sets: 3, reps: "10/noga", rpe: "7", baseXp: 22 },
      { title: "Bočni plank", sets: 3, reps: "30s/str", rpe: "7", baseXp: 20 },
      {
        title: "Udarac medicinkom iznad glave",
        sets: 4,
        reps: "8",
        rpe: "7",
        baseXp: 24,
      },
      { title: "Pogo skokovi", sets: 3, reps: "15", rpe: "7", baseXp: 22 },
      { title: "Vodoravno veslanje", sets: 3, reps: "10", rpe: "7", baseXp: 20 },
    ],
  },
  {
    title: "Razina 5: Brzina i Eksplozivnost",
    description:
      "Reaktivna pliometrija i napredni rad snage za visokoučinkovite sportaše.",
    requiredLevel: 5,
    tags: ["SPEED", "PLYOMETRICS", "STRENGTH"],
    exercises: [
      { title: "Bounding", sets: 4, reps: "25m", rpe: "8", baseXp: 30 },
      { title: "Horizontalni skokovi", sets: 4, reps: "6", rpe: "8", baseXp: 28 },
      { title: "Tuck skokovi", sets: 4, reps: "8", rpe: "8", baseXp: 30 },
      {
        title: "Vježba uz zid – izmjena nogu",
        sets: 4,
        reps: "15s",
        rpe: "7",
        baseXp: 26,
      },
      {
        title: "Most sa šetnjom za stražnju ložu",
        sets: 3,
        reps: "10",
        rpe: "8",
        baseXp: 26,
      },
      { title: "Zgibovi", sets: 4, reps: "6", rpe: "8", baseXp: 28 },
    ],
  },
  {
    title: "Razina 7: Napredno Opterećenje",
    description:
      "Visoko intenzivni trening snage i maksimalne eksplozivnosti za iskusne sportaše.",
    requiredLevel: 7,
    tags: ["STRENGTH", "PLYOMETRICS", "ENDURANCE"],
    exercises: [
      { title: "Rumunjsko mrtvo dizanje", sets: 4, reps: "6", rpe: "8", baseXp: 40 },
      {
        title: "Raznožni skokovi",
        sets: 4,
        reps: "8/noga",
        rpe: "8",
        baseXp: 36,
      },
      { title: "Potisak kuka", sets: 4, reps: "8", rpe: "8", baseXp: 34 },
      { title: "Push press", sets: 4, reps: "6", rpe: "8", baseXp: 38 },
      {
        title: "Jednonožni poskoci",
        sets: 3,
        reps: "6/noga",
        rpe: "8",
        baseXp: 36,
      },
      {
        title: "Bočni skokovi klizača",
        sets: 3,
        reps: "10/str",
        rpe: "8",
        baseXp: 30,
      },
    ],
  },
  {
    title: "Razina 10: Elitna Izvedba",
    description:
      "Kompletan elitni trening koji kombinira maksimalnu snagu, reaktivnost i specifičnu atletsku pripremu.",
    requiredLevel: 10,
    tags: ["SPEED", "STRENGTH", "PLYOMETRICS", "ENDURANCE"],
    exercises: [
      { title: "Skokovi s visine", sets: 5, reps: "5", rpe: "9", baseXp: 50 },
      { title: "Rumunjsko mrtvo dizanje", sets: 5, reps: "5", rpe: "9", baseXp: 48 },
      { title: "Bounding", sets: 5, reps: "30m", rpe: "9", baseXp: 46 },
      {
        title: "Jednonožni poskoci",
        sets: 4,
        reps: "8/noga",
        rpe: "9",
        baseXp: 44,
      },
      { title: "Zgibovi", sets: 5, reps: "8", rpe: "8", baseXp: 40 },
      { title: "Push press", sets: 5, reps: "5", rpe: "9", baseXp: 48 },
      { title: "Potisak kuka", sets: 5, reps: "8", rpe: "8", baseXp: 42 },
    ],
  },
];

const resolveWorkouts = async () => {
  const requiredExerciseTitles = [
    ...new Set(
      workoutBlueprints.flatMap((workout) =>
        workout.exercises.map((exercise) => exercise.title),
      ),
    ),
  ];

  const foundExercises = await Exercise.find(
    { title: { $in: requiredExerciseTitles } },
    { _id: 1, title: 1 },
  ).lean();

  const exerciseByTitle = new Map(
    foundExercises.map((exercise) => [exercise.title, exercise]),
  );

  const missingTitles = requiredExerciseTitles.filter(
    (title) => !exerciseByTitle.has(title),
  );

  if (missingTitles.length > 0) {
    throw new Error(
      `Missing exercises for workout seed: ${missingTitles.join(", ")}. Run exercise seed first.`,
    );
  }

  return workoutBlueprints.map((workout) => ({
    title: workout.title,
    description: workout.description,
    requiredLevel: workout.requiredLevel,
    tags: workout.tags ?? [],
    exercises: workout.exercises.map((exercise) => ({
      exerciseId: exerciseByTitle.get(exercise.title)._id,
      sets: exercise.sets,
      reps: exercise.reps,
      rpe: exercise.rpe,
      baseXp: exercise.baseXp,
    })),
  }));
};

const importData = async () => {
  try {
    const workouts = await resolveWorkouts();
    await Workout.deleteMany({
      $or: [{ createdBy: null }, { createdBy: { $exists: false } }],
    });
    await Workout.insertMany(workouts);
    console.log("Workout seed imported successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error importing workout seed:", err.message);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Workout.deleteMany();
    console.log("Workout seed deleted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error deleting workout seed:", err.message);
    process.exit(1);
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (process.argv.includes("--delete")) {
      await deleteData();
      return;
    }

    await importData();
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
};

run();
