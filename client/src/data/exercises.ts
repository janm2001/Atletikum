export type DashboardExercise = {
    title: string;
    description: string;
    muscleGroup: string;
    imageLink: string;
    videoLink: string;
    level: number;
};

export const EXERCISES: DashboardExercise[] = [
    {
        title: "Sprint Drills (A-Skips)",
        description:
            "Dynamic sprint drill that improves knee drive, rhythm, and sprint mechanics.",
        muscleGroup: "HIP_FLEXORS",
        imageLink:
            "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg",
        videoLink: "https://www.youtube.com/watch?v=8UV0Q4Y4n4Q",
        level: 20,
    },
    {
        title: "Bounding",
        description:
            "Explosive running drill for stride power, elasticity, and horizontal force production.",
        muscleGroup: "GLUTES",
        imageLink:
            "https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg",
        videoLink: "https://www.youtube.com/watch?v=xQ5iK8h2f3A",
        level: 35,
    },
    {
        title: "Box Jumps",
        description:
            "Plyometric jump to develop lower-body explosiveness and reactive power.",
        muscleGroup: "QUADRICEPS",
        imageLink:
            "https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg",
        videoLink: "https://www.youtube.com/watch?v=52r_Ul5k03g",
        level: 30,
    },
    {
        title: "Walking Lunges",
        description:
            "Unilateral strength exercise that improves balance, coordination, and hip stability.",
        muscleGroup: "QUADRICEPS",
        imageLink:
            "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg",
        videoLink: "https://www.youtube.com/watch?v=wrwwXE_x-pQ",
        level: 15,
    },
    {
        title: "Romanian Deadlift",
        description:
            "Posterior-chain movement targeting hamstrings and glutes for sprint and jump performance.",
        muscleGroup: "HAMSTRINGS",
        imageLink:
            "https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg",
        videoLink: "https://www.youtube.com/watch?v=2SHsk9AzdjA",
        level: 45,
    },
    {
        title: "Calf Raises",
        description:
            "Strengthens calves and ankle stiffness for better sprinting and jumping efficiency.",
        muscleGroup: "CALVES",
        imageLink:
            "https://images.pexels.com/photos/4754146/pexels-photo-4754146.jpeg",
        videoLink: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
        level: 10,
    },
    {
        title: "Plank Hold",
        description:
            "Core stability exercise that improves trunk control and force transfer.",
        muscleGroup: "CORE",
        imageLink:
            "https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg",
        videoLink: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
        level: 8,
    },
    {
        title: "Back Extensions",
        description:
            "Builds lower-back endurance and posterior-chain support for athletic posture.",
        muscleGroup: "LOWER_BACK",
        imageLink:
            "https://images.pexels.com/photos/5327463/pexels-photo-5327463.jpeg",
        videoLink: "https://www.youtube.com/watch?v=ph3pddpKzzw",
        level: 18,
    },
    {
        title: "Overhead Press",
        description:
            "Develops shoulder strength and upper-body stability for total athletic performance.",
        muscleGroup: "SHOULDERS",
        imageLink:
            "https://images.pexels.com/photos/949130/pexels-photo-949130.jpeg",
        videoLink: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
        level: 28,
    },
    {
        title: "Thoracic Rotation Mobility",
        description:
            "Mobility drill for thoracic spine rotation to improve running mechanics and posture.",
        muscleGroup: "THORACIC_SPINE",
        imageLink:
            "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg",
        videoLink: "https://www.youtube.com/watch?v=2A2W7j6Yh2M",
        level: 12,
    },
];
