require("dotenv").config();
const mongoose = require("mongoose");
const { Exercise } = require("../models/Exercise");
const MuscleGroup = require("../enums/MuscleGroup.enum");

// Public-domain exercise images from https://github.com/yuhonas/free-exercise-db (Unlicense)
const EXERCISE_IMG_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

/**
 * Maps each exercise title to the closest matching directory in free-exercise-db.
 * Image URL = EXERCISE_IMG_BASE + directoryName + "/0.jpg"
 */
const exerciseImageMap = {
  "A-preskoci": "Fast_Skipping",
  "B-preskoci": "Moving_Claw_Series",
  "Visoka koljena": "Mountain_Climbers",
  "Udarci petom": "Double_Leg_Butt_Kick",
  "Bounding": "Alternate_Leg_Diagonal_Bound",
  "Skokovi na kutiju": "Front_Box_Jump",
  "Skokovi s visine": "Depth_Jump_Leap",
  "Tuck skokovi": "Knee_Tuck_Jump",
  "Raznožni skokovi": "Freehand_Jump_Squat",
  "Bočni skokovi klizača": "Lateral_Bound",
  "Horizontalni skokovi": "Frog_Hops",
  "Jednonožni poskoci": "Hurdle_Hops",
  "Pogo skokovi": "Calf_Raise_On_A_Dumbbell",
  "Vježba uz zid – izmjena nogu": "Linear_Acceleration_Wall_Drill",
  "Bacanje medicinke iz prsa": "Medicine_Ball_Chest_Pass",
  "Udarac medicinkom iznad glave": "One-Arm_Medicine_Ball_Slam",
  "Rumunjsko mrtvo dizanje": "Romanian_Deadlift",
  "Iskoraci u hodu": "Bodyweight_Walking_Lunge",
  "Podizanje na prste": "Standing_Calf_Raises",
  "Jednonožno podizanje na prste": "Dumbbell_Seated_One-Leg_Calf_Raise",
  "Most za gluteuse": "Barbell_Glute_Bridge",
  "Potisak kuka": "Barbell_Hip_Thrust",
  "Plank": "Plank",
  "Bočni plank": "Side_Bridge",
  "Mrtvi kukac": "Dead_Bug",
  "Ekstenzije leđa": "Hyperextensions_Back_Extensions",
  "Ptica i pas": "Downward_Facing_Balance",
  "Potisak iznad glave": "Barbell_Shoulder_Press",
  "Push press": "Double_Kettlebell_Push_Press",
  "Zgibovi": "Pullups",
  "Vodoravno veslanje": "Inverted_Row",
  "Ljuljanje gležnja": "Ankle_Circles",
  "Rotacijska mobilnost prsnog koša": "Iron_Crosses_stretch",
  "Ekstenzija prsnog koša na valjku": "Lower_Back-SMR",
  "Istezanje fleksora kuka": "Kneeling_Hip_Flexor",
  "Most sa šetnjom za stražnju ložu": "Hamstring_Stretch",
};

const getExerciseImageUrl = (title) => {
  const dir = exerciseImageMap[title];
  if (!dir) return "";
  return `${EXERCISE_IMG_BASE}${dir}/0.jpg`;
};

const exercises = [
  {
    title: "A-preskoci",
    description: "Trkačka vježba za podizanje koljena, ritam i uspravnu mehaniku trčanja.",
    muscleGroup: MuscleGroup.HIP_FLEXORS,
    imageLink:
      "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg",
    videoLink: "https://www.youtube.com/watch?v=8UV0Q4Y4n4Q",
    level: 18,
  },
  {
    title: "B-preskoci",
    description:
      "Napredak od A-preskoka s naglaskom na trenutak kontakta stopala s podlogom i ekstenziju noge.",
    muscleGroup: MuscleGroup.HIP_FLEXORS,
    imageLink:
      "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg",
    videoLink: "https://www.youtube.com/watch?v=5S6w7fXQ5Xk",
    level: 22,
  },
  {
    title: "Visoka koljena",
    description:
      "Brza ciklična vježba za treniranje kadence, držanja i frontalne mehanike trčanja.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/260352/pexels-photo-260352.jpeg",
    videoLink: "https://www.youtube.com/watch?v=8opcQdC-V-U",
    level: 12,
  },
  {
    title: "Udarci petom",
    description:
      "Zagrijavajuća vježba usmjerena na aktivaciju stražnje lože i brzu izmjenu nogu.",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    imageLink:
      "https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg",
    videoLink: "https://www.youtube.com/watch?v=S6r7Jf4jWkI",
    level: 10,
  },
  {
    title: "Bounding",
    description:
      "Eksplozivna trkačka vježba za snagu koraka i horizontalnu silu odraza.",
    muscleGroup: MuscleGroup.GLUTES,
    imageLink:
      "https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg",
    videoLink: "https://www.youtube.com/watch?v=xQ5iK8h2f3A",
    level: 35,
  },
  {
    title: "Skokovi na kutiju",
    description:
      "Pliometrijski skok na kutiju za razvoj eksplozivnosti donjih ekstremiteta i reaktivne snage.",
    muscleGroup: MuscleGroup.QUADRICEPS,
    imageLink:
      "https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg",
    videoLink: "https://www.youtube.com/watch?v=52r_Ul5k03g",
    level: 30,
  },
  {
    title: "Skokovi s visine",
    description:
      "Reaktivni pliometrijski skok za poboljšanje krutosti tetiva i brzine produkcije sile.",
    muscleGroup: MuscleGroup.CALVES,
    imageLink: "https://images.pexels.com/photos/28080/pexels-photo.jpg",
    videoLink: "https://www.youtube.com/watch?v=hNfJ5m6X7VA",
    level: 48,
  },
  {
    title: "Tuck skokovi",
    description:
      "Vertikalni pliometrijski skok s naglaskom na brzo podizanje koljena i kontrolu doskoka.",
    muscleGroup: MuscleGroup.QUADRICEPS,
    imageLink:
      "https://images.pexels.com/photos/2261485/pexels-photo-2261485.jpeg",
    videoLink: "https://www.youtube.com/watch?v=8rQ0xQ5N9L4",
    level: 32,
  },
  {
    title: "Raznožni skokovi",
    description:
      "Unilateralna pliometrijska vježba za snagu, ravnotežu i stabilnost kuka.",
    muscleGroup: MuscleGroup.QUADRICEPS,
    imageLink:
      "https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg",
    videoLink: "https://www.youtube.com/watch?v=7VbY7H4x0JY",
    level: 34,
  },
  {
    title: "Bočni skokovi klizača",
    description:
      "Bočni skokovi za razvoj eksplozivnosti u frontalnoj ravnini kretanja.",
    muscleGroup: MuscleGroup.GLUTES,
    imageLink:
      "https://images.pexels.com/photos/703012/pexels-photo-703012.jpeg",
    videoLink: "https://www.youtube.com/watch?v=Qj4hQ7VQx3Y",
    level: 26,
  },
  {
    title: "Horizontalni skokovi",
    description: "Horizontalni skok za poboljšanje mehanike ubrzanja i odraza.",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    imageLink:
      "https://images.pexels.com/photos/685534/pexels-photo-685534.jpeg",
    videoLink: "https://www.youtube.com/watch?v=VfM2s1TQf2Q",
    level: 27,
  },
  {
    title: "Jednonožni poskoci",
    description:
      "Unilateralna reaktivna vježba skokanja za kontrolu gležnja i koljena te razvoj snage.",
    muscleGroup: MuscleGroup.ANKLES,
    imageLink:
      "https://images.pexels.com/photos/1465889/pexels-photo-1465889.jpeg",
    videoLink: "https://www.youtube.com/watch?v=6aP5x8vV6gk",
    level: 40,
  },
  {
    title: "Pogo skokovi",
    description:
      "Brzi skokovi male amplitude za krutost gležnja i elastični povrat energije.",
    muscleGroup: MuscleGroup.ANKLES,
    imageLink:
      "https://images.pexels.com/photos/235922/pexels-photo-235922.jpeg",
    videoLink: "https://www.youtube.com/watch?v=5w3c4D6n9eU",
    level: 19,
  },
  {
    title: "Vježba uz zid – izmjena nogu",
    description:
      "Tehnička vježba za kut potkoljenice pri sprintu i agresivan kontakt s podlogom.",
    muscleGroup: MuscleGroup.HIP_FLEXORS,
    imageLink:
      "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg",
    videoLink: "https://www.youtube.com/watch?v=Y5W9M2BqQkY",
    level: 24,
  },
  {
    title: "Bacanje medicinke iz prsa",
    description:
      "Bacanje medicinke iz prsa za razvoj snage gornjeg dijela tijela i koordinacije.",
    muscleGroup: MuscleGroup.SHOULDERS,
    imageLink:
      "https://images.pexels.com/photos/949131/pexels-photo-949131.jpeg",
    videoLink: "https://www.youtube.com/watch?v=5v4fQx2f3js",
    level: 21,
  },
  {
    title: "Udarac medicinkom iznad glave",
    description:
      "Balistički pokret cijelog tijela za snagu i aktivaciju trupa.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg",
    videoLink: "https://www.youtube.com/watch?v=4QfRj1V2f5s",
    level: 23,
  },
  {
    title: "Rumunjsko mrtvo dizanje",
    description: "Vježba stražnjeg lanca usmjerena na stražnju ložu i gluteuse.",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    imageLink:
      "https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg",
    videoLink: "https://www.youtube.com/watch?v=2SHsk9AzdjA",
    level: 45,
  },
  {
    title: "Iskoraci u hodu",
    description:
      "Unilateralna vježba snage za ravnotežu i kontrolu donjih ekstremiteta.",
    muscleGroup: MuscleGroup.QUADRICEPS,
    imageLink:
      "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg",
    videoLink: "https://www.youtube.com/watch?v=wrwwXE_x-pQ",
    level: 15,
  },
  {
    title: "Podizanje na prste",
    description:
      "Jača listove i krutost gležnja za sprint i skokove.",
    muscleGroup: MuscleGroup.CALVES,
    imageLink:
      "https://images.pexels.com/photos/4754146/pexels-photo-4754146.jpeg",
    videoLink: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
    level: 10,
  },
  {
    title: "Jednonožno podizanje na prste",
    description: "Jednonožna varijacija za poboljšanje simetrije snage gležnja.",
    muscleGroup: MuscleGroup.CALVES,
    imageLink:
      "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg",
    videoLink: "https://www.youtube.com/watch?v=7U4zvM4K6sQ",
    level: 16,
  },
  {
    title: "Most za gluteuse",
    description:
      "Temeljna vježba ekstenzije kuka za prijenos snage pri sprintu i skokovima.",
    muscleGroup: MuscleGroup.GLUTES,
    imageLink:
      "https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg",
    videoLink: "https://www.youtube.com/watch?v=wPM8icPu6H8",
    level: 8,
  },
  {
    title: "Potisak kuka",
    description: "Vježba visokog intenziteta za snagu gluteusa i snagu ubrzanja.",
    muscleGroup: MuscleGroup.GLUTES,
    imageLink:
      "https://images.pexels.com/photos/669578/pexels-photo-669578.jpeg",
    videoLink: "https://www.youtube.com/watch?v=LM8XHLYJoYs",
    level: 38,
  },
  {
    title: "Plank",
    description:
      "Vježba stabilnosti trupa koja poboljšava kontrolu torza i prijenos sile.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg",
    videoLink: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    level: 8,
  },
  {
    title: "Bočni plank",
    description: "Vježba trupa protiv bočne fleksije za stabilnost kuka i torza.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg",
    videoLink: "https://www.youtube.com/watch?v=K2VljzCC16g",
    level: 14,
  },
  {
    title: "Mrtvi kukac",
    description:
      "Vježba motoričke kontrole koja pojačava krutost trupa uz pokrete udova.",
    muscleGroup: MuscleGroup.CORE,
    imageLink:
      "https://images.pexels.com/photos/6456303/pexels-photo-6456303.jpeg",
    videoLink: "https://www.youtube.com/watch?v=g_BYB0R-4Ws",
    level: 12,
  },
  {
    title: "Ekstenzije leđa",
    description:
      "Razvija izdržljivost donjeg dijela leđa i potporu stražnjeg lanca za pravilno držanje.",
    muscleGroup: MuscleGroup.LOWER_BACK,
    imageLink:
      "https://images.pexels.com/photos/5327463/pexels-photo-5327463.jpeg",
    videoLink: "https://www.youtube.com/watch?v=ph3pddpKzzw",
    level: 18,
  },
  {
    title: "Ptica i pas",
    description:
      "Vježba stabilnosti trupa u križnom obrascu za kontrolu stražnjeg lanca.",
    muscleGroup: MuscleGroup.LOWER_BACK,
    imageLink:
      "https://images.pexels.com/photos/6456146/pexels-photo-6456146.jpeg",
    videoLink: "https://www.youtube.com/watch?v=wiFNA3sqjCA",
    level: 9,
  },
  {
    title: "Potisak iznad glave",
    description:
      "Razvija snagu ramena i stabilnost gornjeg dijela tijela za atletski učinak.",
    muscleGroup: MuscleGroup.SHOULDERS,
    imageLink:
      "https://images.pexels.com/photos/949130/pexels-photo-949130.jpeg",
    videoLink: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    level: 28,
  },
  {
    title: "Push press",
    description:
      "Eksplozivni potisak iznad glave uz odraz nogama za snagu gornjeg dijela tijela.",
    muscleGroup: MuscleGroup.SHOULDERS,
    imageLink:
      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg",
    videoLink: "https://www.youtube.com/watch?v=iaBVSJm78ko",
    level: 36,
  },
  {
    title: "Zgibovi",
    description:
      "Vježba vertikalnog povlačenja za razvoj gornjeg dijela leđa.",
    muscleGroup: MuscleGroup.BACK,
    imageLink:
      "https://images.pexels.com/photos/791763/pexels-photo-791763.jpeg",
    videoLink: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    level: 33,
  },
  {
    title: "Vodoravno veslanje",
    description:
      "Varijanta horizontalnog povlačenja s težinom tijela za razvoj snage leđa.",
    muscleGroup: MuscleGroup.BACK,
    imageLink:
      "https://images.pexels.com/photos/6551413/pexels-photo-6551413.jpeg",
    videoLink: "https://www.youtube.com/watch?v=sivH6V5KJw8",
    level: 20,
  },
  {
    title: "Ljuljanje gležnja",
    description: "Mobilizacijska vježba za bolji raspon pokreta gležnja i mehaniku doskoka.",
    muscleGroup: MuscleGroup.ANKLES,
    imageLink:
      "https://images.pexels.com/photos/3757956/pexels-photo-3757956.jpeg",
    videoLink: "https://www.youtube.com/watch?v=IikP_teeLkI",
    level: 7,
  },
  {
    title: "Rotacijska mobilnost prsnog koša",
    description: "Mobilizacijska vježba za rotaciju torakalne kralježnice i pravilno držanje.",
    muscleGroup: MuscleGroup.THORACIC_SPINE,
    imageLink:
      "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg",
    videoLink: "https://www.youtube.com/watch?v=2A2W7j6Yh2M",
    level: 12,
  },
  {
    title: "Ekstenzija prsnog koša na valjku",
    description:
      "Mobilizacijska vježba ekstenzije za kvalitetu pokreta gornjeg dijela leđa.",
    muscleGroup: MuscleGroup.THORACIC_SPINE,
    imageLink:
      "https://images.pexels.com/photos/6455877/pexels-photo-6455877.jpeg",
    videoLink: "https://www.youtube.com/watch?v=6Y6w8j3Q8nQ",
    level: 11,
  },
  {
    title: "Istezanje fleksora kuka",
    description:
      "Mobilizacijska vježba za kapacitet ekstenzije kuka i pravilno držanje pri sprintu.",
    muscleGroup: MuscleGroup.HIP_FLEXORS,
    imageLink:
      "https://images.pexels.com/photos/3757374/pexels-photo-3757374.jpeg",
    videoLink: "https://www.youtube.com/watch?v=7bRaX6M2nr8",
    level: 6,
  },
  {
    title: "Most sa šetnjom za stražnju ložu",
    description:
      "Ekscentrična vježba usmjerena na stražnju ložu za otpornost i kontrolu.",
    muscleGroup: MuscleGroup.HAMSTRINGS,
    imageLink:
      "https://images.pexels.com/photos/6456159/pexels-photo-6456159.jpeg",
    videoLink: "https://www.youtube.com/watch?v=5X4jQx3w2y8",
    level: 25,
  },
];

const importData = async () => {
  try {
    const exercisesWithMappedImages = exercises.map((exercise) => ({
      ...exercise,
      imageLink: getExerciseImageUrl(exercise.title),
    }));

    await Exercise.deleteMany();
    await Exercise.insertMany(exercisesWithMappedImages);
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
