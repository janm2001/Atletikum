require("dotenv").config();
const mongoose = require("mongoose");
const { Exercise } = require("../models/Exercise");
const MuscleGroup = require("../enums/MuscleGroup.enum");

const exercises = [
  {
    title: "Sprint Drills (A-Skips)",
    description:
      "Dynamic sprint drill that improves knee drive, rhythm, and sprint mechanics.",
    muscleGroup: MuscleGroup.HIP_FLEXORS,
    imageLink:
      "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg",
    videoLink: "https://www.youtube.com/watch?v=8UV0Q4Y4n4Q",
    level: 20,
  },
  {
    title: "Bounding",
    description:
      "Explosive running drill for stride power, elasticity, and horizontal force production.",
    muscleGroup: MuscleGroup.GLUTES,
    imageLink:
      "https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg",
    videoLink: "https://www.youtube.com/watch?v=xQ5iK8h2f3A",
    level: 35,
  },
  {
    title: "Box Jumps",
    description:
      "Plyometric jump to develop lower-body explosiveness and reactive power.",
    muscleGroup: MuscleGroup.QUADRICEPS,
    imageLink:
      "https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg",
    videoLink: "https://www.youtube.com/watch?v=52r_Ul5k03g",
    level: 30,
  },
  {
    title: "Walking Lunges",
    description:
      "Unilateral strength exercise that improves balance, coordination, and hip stability.",
    muscleGroup: MuscleGroup.QUADRICEPS,
    imageLink:
      "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg",
    videoLink: "https://www.youtube.com/watch?v=wrwwXE_x-pQ",
    level: 15,
  },
  {
    title: "Romanian Deadlift",
    description:
      "Posterior-chain movement targeting hamstrings and glutes for sprint and jump performance.",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    imageLink:
      "https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg",
    videoLink: "https://www.youtube.com/watch?v=2SHsk9AzdjA",
    level: 45,
  },
  {
    title: "Calf Raises",
    description:
      "Strengthens calves and ankle stiffness for better sprinting and jumping efficiency.",
    muscleGroup: MuscleGroup.CALVES,
    imageLink:
      "https://images.pexels.com/photos/4754146/pexels-photo-4754146.jpeg",
    videoLink: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
    level: 10,
  },
  {
    title: "Plank Hold",
    description:
      "Core stability exercise that improves trunk control and force transfer.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg",
    videoLink: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    level: 8,
  },
  {
    title: "Back Extensions",
    description:
      "Builds lower-back endurance and posterior-chain support for athletic posture.",
    muscleGroup: MuscleGroup.LOWER_BACK,
    imageLink:
      "https://images.pexels.com/photos/5327463/pexels-photo-5327463.jpeg",
    videoLink: "https://www.youtube.com/watch?v=ph3pddpKzzw",
    level: 18,
  },
  {
    title: "Overhead Press",
    description:
      "Develops shoulder strength and upper-body stability for total athletic performance.",
    muscleGroup: MuscleGroup.SHOULDERS,
    imageLink:
      "https://images.pexels.com/photos/949130/pexels-photo-949130.jpeg",
    videoLink: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    level: 28,
  },
  {
    title: "Thoracic Rotation Mobility",
    description:
      "Mobility drill for thoracic spine rotation to improve running mechanics and posture.",
    muscleGroup: MuscleGroup.THORACIC_SPINE,
    imageLink:
      "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg",
    videoLink: "https://www.youtube.com/watch?v=2A2W7j6Yh2M",
    level: 12,
  },
];

const importData = async () => {
  try {
    await Exercise.deleteMany();
    await Exercise.insertMany(exercises);
    console.log("Exercise seed imported successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error importing exercise seed:", err.message);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Exercise.deleteMany();
    console.log("Exercise seed deleted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error deleting exercise seed:", err.message);
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
