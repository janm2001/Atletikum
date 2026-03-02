require("dotenv").config();
const mongoose = require("mongoose");
const { Exercise } = require("../models/Exercise");
const MuscleGroup = require("../enums/MuscleGroup.enum");

const exercises = [
  {
    title: "A-Skips",
    description: "Sprint drill for knee drive, rhythm, and upright mechanics.",
    muscleGroup: MuscleGroup.HIP_FLEXORS,
    imageLink:
      "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg",
    videoLink: "https://www.youtube.com/watch?v=8UV0Q4Y4n4Q",
    level: 18,
  },
  {
    title: "B-Skips",
    description:
      "Progression from A-skips emphasizing foot strike timing and extension.",
    muscleGroup: MuscleGroup.HIP_FLEXORS,
    imageLink:
      "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg",
    videoLink: "https://www.youtube.com/watch?v=5S6w7fXQ5Xk",
    level: 22,
  },
  {
    title: "High Knees",
    description:
      "Fast cyclical drill to train cadence, posture, and front-side mechanics.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/260352/pexels-photo-260352.jpeg",
    videoLink: "https://www.youtube.com/watch?v=8opcQdC-V-U",
    level: 12,
  },
  {
    title: "Butt Kicks",
    description:
      "Warm-up drill focused on hamstring activation and leg turnover.",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    imageLink:
      "https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg",
    videoLink: "https://www.youtube.com/watch?v=S6r7Jf4jWkI",
    level: 10,
  },
  {
    title: "Bounding",
    description:
      "Explosive running drill for stride power and horizontal force.",
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
    title: "Depth Jumps",
    description:
      "Reactive plyometric to improve stiffness and rapid force production.",
    muscleGroup: MuscleGroup.CALVES,
    imageLink: "https://images.pexels.com/photos/28080/pexels-photo.jpg",
    videoLink: "https://www.youtube.com/watch?v=hNfJ5m6X7VA",
    level: 48,
  },
  {
    title: "Tuck Jumps",
    description:
      "Vertical plyometric emphasizing rapid knee drive and landing control.",
    muscleGroup: MuscleGroup.QUADRICEPS,
    imageLink:
      "https://images.pexels.com/photos/2261485/pexels-photo-2261485.jpeg",
    videoLink: "https://www.youtube.com/watch?v=8rQ0xQ5N9L4",
    level: 32,
  },
  {
    title: "Split Squat Jumps",
    description:
      "Unilateral plyometric drill for power, balance, and hip stability.",
    muscleGroup: MuscleGroup.QUADRICEPS,
    imageLink:
      "https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg",
    videoLink: "https://www.youtube.com/watch?v=7VbY7H4x0JY",
    level: 34,
  },
  {
    title: "Lateral Skater Jumps",
    description:
      "Side-to-side power drill improving frontal-plane explosiveness.",
    muscleGroup: MuscleGroup.GLUTES,
    imageLink:
      "https://images.pexels.com/photos/703012/pexels-photo-703012.jpeg",
    videoLink: "https://www.youtube.com/watch?v=Qj4hQ7VQx3Y",
    level: 26,
  },
  {
    title: "Broad Jumps",
    description: "Horizontal jump variation to improve acceleration mechanics.",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    imageLink:
      "https://images.pexels.com/photos/685534/pexels-photo-685534.jpeg",
    videoLink: "https://www.youtube.com/watch?v=VfM2s1TQf2Q",
    level: 27,
  },
  {
    title: "Single-Leg Hops",
    description:
      "Unilateral reactive hopping drill for ankle-knee control and power.",
    muscleGroup: MuscleGroup.ANKLES,
    imageLink:
      "https://images.pexels.com/photos/1465889/pexels-photo-1465889.jpeg",
    videoLink: "https://www.youtube.com/watch?v=6aP5x8vV6gk",
    level: 40,
  },
  {
    title: "Pogo Jumps",
    description:
      "Quick low-amplitude jumps for ankle stiffness and elastic return.",
    muscleGroup: MuscleGroup.ANKLES,
    imageLink:
      "https://images.pexels.com/photos/235922/pexels-photo-235922.jpeg",
    videoLink: "https://www.youtube.com/watch?v=5w3c4D6n9eU",
    level: 19,
  },
  {
    title: "Wall Drill (Switches)",
    description:
      "Technical drill for sprint shin angles and aggressive ground contact.",
    muscleGroup: MuscleGroup.HIP_FLEXORS,
    imageLink:
      "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg",
    videoLink: "https://www.youtube.com/watch?v=Y5W9M2BqQkY",
    level: 24,
  },
  {
    title: "Medicine Ball Chest Throw",
    description:
      "Upper-body power throw improving force transfer and coordination.",
    muscleGroup: MuscleGroup.SHOULDERS,
    imageLink:
      "https://images.pexels.com/photos/949131/pexels-photo-949131.jpeg",
    videoLink: "https://www.youtube.com/watch?v=5v4fQx2f3js",
    level: 21,
  },
  {
    title: "Medicine Ball Overhead Slam",
    description:
      "Total-body ballistic movement for power and trunk engagement.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg",
    videoLink: "https://www.youtube.com/watch?v=4QfRj1V2f5s",
    level: 23,
  },
  {
    title: "Romanian Deadlift",
    description: "Posterior-chain movement targeting hamstrings and glutes.",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    imageLink:
      "https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg",
    videoLink: "https://www.youtube.com/watch?v=2SHsk9AzdjA",
    level: 45,
  },
  {
    title: "Walking Lunges",
    description:
      "Unilateral strength exercise for balance and lower-body control.",
    muscleGroup: MuscleGroup.QUADRICEPS,
    imageLink:
      "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg",
    videoLink: "https://www.youtube.com/watch?v=wrwwXE_x-pQ",
    level: 15,
  },
  {
    title: "Calf Raises",
    description:
      "Strengthens calves and ankle stiffness for sprinting and jumping.",
    muscleGroup: MuscleGroup.CALVES,
    imageLink:
      "https://images.pexels.com/photos/4754146/pexels-photo-4754146.jpeg",
    videoLink: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
    level: 10,
  },
  {
    title: "Single-Leg Calf Raises",
    description: "Single-leg variation for improved ankle strength symmetry.",
    muscleGroup: MuscleGroup.CALVES,
    imageLink:
      "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg",
    videoLink: "https://www.youtube.com/watch?v=7U4zvM4K6sQ",
    level: 16,
  },
  {
    title: "Glute Bridge",
    description:
      "Foundational hip-extension drill for sprint and jump transfer.",
    muscleGroup: MuscleGroup.GLUTES,
    imageLink:
      "https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg",
    videoLink: "https://www.youtube.com/watch?v=wPM8icPu6H8",
    level: 8,
  },
  {
    title: "Hip Thrust",
    description: "High-output glute strength movement for acceleration power.",
    muscleGroup: MuscleGroup.GLUTES,
    imageLink:
      "https://images.pexels.com/photos/669578/pexels-photo-669578.jpeg",
    videoLink: "https://www.youtube.com/watch?v=LM8XHLYJoYs",
    level: 38,
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
    title: "Side Plank",
    description: "Anti-lateral-flexion core drill for hip and trunk stability.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg",
    videoLink: "https://www.youtube.com/watch?v=K2VljzCC16g",
    level: 14,
  },
  {
    title: "Dead Bug",
    description:
      "Motor-control exercise reinforcing trunk stiffness with limb motion.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/6456303/pexels-photo-6456303.jpeg",
    videoLink: "https://www.youtube.com/watch?v=g_BYB0R-4Ws",
    level: 12,
  },
  {
    title: "Back Extensions",
    description:
      "Builds lower-back endurance and posterior-chain support for posture.",
    muscleGroup: MuscleGroup.LOWER_BACK,
    imageLink:
      "https://images.pexels.com/photos/5327463/pexels-photo-5327463.jpeg",
    videoLink: "https://www.youtube.com/watch?v=ph3pddpKzzw",
    level: 18,
  },
  {
    title: "Bird Dog",
    description:
      "Cross-pattern trunk stability drill for posterior-chain control.",
    muscleGroup: MuscleGroup.LOWER_BACK,
    imageLink:
      "https://images.pexels.com/photos/6456146/pexels-photo-6456146.jpeg",
    videoLink: "https://www.youtube.com/watch?v=wiFNA3sqjCA",
    level: 9,
  },
  {
    title: "Overhead Press",
    description:
      "Develops shoulder strength and upper-body stability for athletic output.",
    muscleGroup: MuscleGroup.SHOULDERS,
    imageLink:
      "https://images.pexels.com/photos/949130/pexels-photo-949130.jpeg",
    videoLink: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    level: 28,
  },
  {
    title: "Push Press",
    description:
      "Explosive overhead press using leg drive for upper-body power.",
    muscleGroup: MuscleGroup.SHOULDERS,
    imageLink:
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg",
    videoLink: "https://www.youtube.com/watch?v=iaBVSJm78ko",
    level: 36,
  },
  {
    title: "Pull-Ups",
    description:
      "Vertical pulling strength exercise for upper-back development.",
    muscleGroup: MuscleGroup.BACK,
    imageLink:
      "https://images.pexels.com/photos/791763/pexels-photo-791763.jpeg",
    videoLink: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    level: 33,
  },
  {
    title: "Inverted Rows",
    description:
      "Bodyweight row variation to build horizontal pulling strength.",
    muscleGroup: MuscleGroup.BACK,
    imageLink:
      "https://images.pexels.com/photos/6551413/pexels-photo-6551413.jpeg",
    videoLink: "https://www.youtube.com/watch?v=sivH6V5KJw8",
    level: 20,
  },
  {
    title: "Ankle Dorsiflexion Rocks",
    description: "Mobility drill for better ankle range and landing mechanics.",
    muscleGroup: MuscleGroup.ANKLES,
    imageLink:
      "https://images.pexels.com/photos/3757956/pexels-photo-3757956.jpeg",
    videoLink: "https://www.youtube.com/watch?v=IikP_teeLkI",
    level: 7,
  },
  {
    title: "Thoracic Rotation Mobility",
    description: "Mobility drill for thoracic spine rotation and posture.",
    muscleGroup: MuscleGroup.THORACIC_SPINE,
    imageLink:
      "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg",
    videoLink: "https://www.youtube.com/watch?v=2A2W7j6Yh2M",
    level: 12,
  },
  {
    title: "Thoracic Extension on Foam Roller",
    description:
      "Extension-focused mobility drill for upper-back movement quality.",
    muscleGroup: MuscleGroup.THORACIC_SPINE,
    imageLink:
      "https://images.pexels.com/photos/6455877/pexels-photo-6455877.jpeg",
    videoLink: "https://www.youtube.com/watch?v=6Y6w8j3Q8nQ",
    level: 11,
  },
  {
    title: "Hip Flexor Stretch",
    description:
      "Mobility drill for hip extension capacity and sprint posture.",
    muscleGroup: MuscleGroup.HIP_FLEXORS,
    imageLink:
      "https://images.pexels.com/photos/3757374/pexels-photo-3757374.jpeg",
    videoLink: "https://www.youtube.com/watch?v=7bRaX6M2nr8",
    level: 6,
  },
  {
    title: "Hamstring Bridge Walkouts",
    description:
      "Eccentric hamstring-focused drill for resilience and control.",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    imageLink:
      "https://images.pexels.com/photos/6456159/pexels-photo-6456159.jpeg",
    videoLink: "https://www.youtube.com/watch?v=5X4jQx3w2y8",
    level: 25,
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
