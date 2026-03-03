require("dotenv").config();
const mongoose = require("mongoose");
const { Workout } = require("../models/Workout");
const { Exercise } = require("../models/Exercise");

const workoutBlueprints = [
  {
    title: "Level 1 - Athletic Foundations",
    description:
      "Basic sprint mechanics, core control, and foundational lower-body strength.",
    requiredLevel: 1,
    exercises: [
      { title: "A-Skips", sets: 3, reps: "20m", rpe: "6", baseXp: 20 },
      { title: "High Knees", sets: 3, reps: "20m", rpe: "6", baseXp: 18 },
      { title: "Glute Bridge", sets: 3, reps: "12", rpe: "6", baseXp: 16 },
      { title: "Plank Hold", sets: 3, reps: "30s", rpe: "6", baseXp: 16 },
      { title: "Calf Raises", sets: 3, reps: "15", rpe: "6", baseXp: 15 },
    ],
  },
  {
    title: "Level 2 - Power & Coordination",
    description:
      "Intermediate plyometrics and unilateral control to build athletic power output.",
    requiredLevel: 2,
    exercises: [
      { title: "B-Skips", sets: 3, reps: "20m", rpe: "7", baseXp: 24 },
      { title: "Box Jumps", sets: 4, reps: "6", rpe: "7", baseXp: 26 },
      {
        title: "Walking Lunges",
        sets: 3,
        reps: "10/leg",
        rpe: "7",
        baseXp: 22,
      },
      { title: "Side Plank", sets: 3, reps: "30s/side", rpe: "7", baseXp: 20 },
      {
        title: "Medicine Ball Overhead Slam",
        sets: 4,
        reps: "8",
        rpe: "7",
        baseXp: 24,
      },
    ],
  },
  {
    title: "Level 3 - Speed & Explosiveness",
    description:
      "Advanced reactive plyometrics and strength work for high-performance athletes.",
    requiredLevel: 3,
    exercises: [
      { title: "Bounding", sets: 4, reps: "25m", rpe: "8", baseXp: 30 },
      { title: "Depth Jumps", sets: 4, reps: "5", rpe: "8", baseXp: 32 },
      {
        title: "Split Squat Jumps",
        sets: 4,
        reps: "8/leg",
        rpe: "8",
        baseXp: 30,
      },
      { title: "Romanian Deadlift", sets: 4, reps: "6", rpe: "8", baseXp: 28 },
      {
        title: "Hamstring Bridge Walkouts",
        sets: 3,
        reps: "10",
        rpe: "8",
        baseXp: 26,
      },
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
    await Workout.deleteMany();
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
