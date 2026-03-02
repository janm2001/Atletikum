import { useQuery } from "@tanstack/react-query";
import type { Exercise } from "../types/Exercise/exercise";
import { MuscleGroup, type MuscleGroupValue } from "../enums/muscleGroup";

type ExerciseDbItem = {
    id: string;
    name: string;
    bodyPart: string;
    target: string;
    gifUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    equipment?: string;
    instructions?: string[];
};

const exerciseImageObjectUrlCache = new Map<string, string>();
const ATHLETIC_BODY_PARTS = ["cardio", "upper legs", "lower legs", "waist"];
const ATHLETIC_KEYWORDS = [
    "drill",
    "plyo",
    "plyometric",
    "sprint",
    "jump",
    "hop",
    "bound",
    "agility",
    "speed",
    "acceleration",
    "deceleration",
    "lateral",
    "shuttle",
    "skater",
    "high knees",
    "burpee",
    "box jump",
    "depth jump",
    "tuck jump",
];

const EXERCISEDB_BASE_URL =
    import.meta.env.VITE_EXERCISEDB_BASE_URL ?? "https://exercisedb.p.rapidapi.com";
const EXERCISEDB_HOST =
    import.meta.env.VITE_EXERCISEDB_HOST ?? "exercisedb.p.rapidapi.com";
const EXERCISEDB_API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY;
const EXERCISEDB_IMAGE_SERVICE_BASE_URL =
    import.meta.env.VITE_EXERCISEDB_IMAGE_SERVICE_BASE_URL ?? "https://cdn.exercisedb.dev/exercisedb";
const EXERCISEDB_VIDEO_SERVICE_BASE_URL =
    import.meta.env.VITE_EXERCISEDB_VIDEO_SERVICE_BASE_URL ?? "https://cdn.exercisedb.dev/exercisedb";

const isAbsoluteUrl = (value: string): boolean => /^(https?:)?\/\//i.test(value);

const resolveAssetUrl = (
    assetPath: string | undefined,
    serviceBaseUrl: string
): string | undefined => {
    if (!assetPath) {
        return undefined;
    }

    if (isAbsoluteUrl(assetPath)) {
        return assetPath;
    }

    const trimmedBase = serviceBaseUrl.replace(/\/+$/, "");
    const trimmedPath = assetPath.replace(/^\/+/, "");
    return `${trimmedBase}/${encodeURIComponent(trimmedPath)}`;
};

const fetchExerciseImageObjectUrl = async (
    exerciseId: string,
    headers: Record<string, string>,
    signal?: AbortSignal
): Promise<string | undefined> => {
    const cached = exerciseImageObjectUrlCache.get(exerciseId);
    if (cached) {
        return cached;
    }

    const imageResponse = await fetch(
        `${EXERCISEDB_BASE_URL}/image?exerciseId=${encodeURIComponent(exerciseId)}&resolution=360`,
        {
            headers,
            signal,
        }
    );

    if (!imageResponse.ok) {
        return undefined;
    }

    const imageBlob = await imageResponse.blob();
    const objectUrl = URL.createObjectURL(imageBlob);
    exerciseImageObjectUrlCache.set(exerciseId, objectUrl);
    return objectUrl;
};

const mapToMuscleGroup = (item: ExerciseDbItem): MuscleGroupValue => {
    const source = `${item.bodyPart} ${item.target}`.toLowerCase();

    if (source.includes("quad")) return MuscleGroup.QUADRICEPS;
    if (source.includes("hamstring")) return MuscleGroup.HAMSTRINGS;
    if (source.includes("glute")) return MuscleGroup.GLUTES;
    if (source.includes("calf")) return MuscleGroup.CALVES;
    if (source.includes("hip")) return MuscleGroup.HIP_FLEXORS;
    if (source.includes("core") || source.includes("abs") || source.includes("waist")) return MuscleGroup.CORE;
    if (source.includes("lower back") || source.includes("spine erector")) return MuscleGroup.LOWER_BACK;
    if (source.includes("back") || source.includes("lats") || source.includes("traps")) return MuscleGroup.BACK;
    if (source.includes("shoulder") || source.includes("deltoid")) return MuscleGroup.SHOULDERS;
    if (source.includes("ankle") || source.includes("tibialis")) return MuscleGroup.ANKLES;
    if (source.includes("thoracic")) return MuscleGroup.THORACIC_SPINE;

    return MuscleGroup.CORE;
};

const getAthleticScore = (item: ExerciseDbItem): number => {
    const searchableText = `${item.name} ${item.bodyPart} ${item.target} ${(item.instructions ?? []).join(" ")}`.toLowerCase();

    let score = 0;
    ATHLETIC_KEYWORDS.forEach((keyword) => {
        if (searchableText.includes(keyword)) {
            score += 5;
        }
    });

    if (item.bodyPart.toLowerCase() === "cardio") {
        score += 6;
    }

    if (item.bodyPart.toLowerCase().includes("legs")) {
        score += 4;
    }

    if (item.target.toLowerCase().includes("calves") || item.target.toLowerCase().includes("quads")) {
        score += 2;
    }

    return score;
};

const mapExerciseDbToExercise = (item: ExerciseDbItem): Exercise => ({
    _id: item.id,
    title: item.name,
    description:
        item.instructions?.slice(0, 2).join(" ") ||
        `Exercise for ${item.target} using ${item.equipment ?? "bodyweight"}.`,
    muscleGroup: mapToMuscleGroup(item),
    imageLink:
        resolveAssetUrl(item.gifUrl, EXERCISEDB_IMAGE_SERVICE_BASE_URL) ||
        resolveAssetUrl(item.imageUrl, EXERCISEDB_IMAGE_SERVICE_BASE_URL),
    videoLink: resolveAssetUrl(item.videoUrl, EXERCISEDB_VIDEO_SERVICE_BASE_URL),
    level: 20,
});

export function useExerciseDbExercises(limit = 50) {
    return useQuery<Exercise[], Error>({
        queryKey: ["exercisedb", "list", limit],
        queryFn: async ({ signal }) => {
            if (!EXERCISEDB_API_KEY) {
                throw new Error(
                    "Nedostaje VITE_EXERCISEDB_API_KEY u client/.env datoteci."
                );
            }

            const headers = {
                "X-RapidAPI-Key": EXERCISEDB_API_KEY,
                "X-RapidAPI-Host": EXERCISEDB_HOST,
            };

            const bodyPartResponses = await Promise.all(
                ATHLETIC_BODY_PARTS.map((bodyPart) =>
                    fetch(
                        `${EXERCISEDB_BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=0`,
                        {
                            headers,
                            signal,
                        }
                    )
                )
            );

            const successfulBodyPartResponses = bodyPartResponses.filter((response) => response.ok);

            let data: ExerciseDbItem[] = [];

            if (successfulBodyPartResponses.length > 0) {
                const bodyPartData = await Promise.all(
                    successfulBodyPartResponses.map(
                        async (response) => (await response.json()) as ExerciseDbItem[]
                    )
                );

                const merged = bodyPartData.flat();
                data = Array.from(new Map(merged.map((item) => [item.id, item])).values());
            } else {
                const fallbackResponse = await fetch(
                    `${EXERCISEDB_BASE_URL}/exercises?limit=${limit}&offset=0`,
                    {
                        headers,
                        signal,
                    }
                );

                if (!fallbackResponse.ok) {
                    throw new Error("Greška pri dohvaćanju ExerciseDB podataka.");
                }

                data = (await fallbackResponse.json()) as ExerciseDbItem[];
            }

            const prioritizedAthleticData = [...data]
                .sort((firstItem, secondItem) => {
                    const scoreDiff = getAthleticScore(secondItem) - getAthleticScore(firstItem);
                    if (scoreDiff !== 0) {
                        return scoreDiff;
                    }

                    return firstItem.name.localeCompare(secondItem.name);
                })
                .slice(0, limit);

            const exercises = prioritizedAthleticData.map(mapExerciseDbToExercise);

            const exercisesWithResolvedImages = await Promise.all(
                exercises.map(async (exercise, index) => {
                    if (exercise.imageLink) {
                        return exercise;
                    }

                    const fallbackImage = await fetchExerciseImageObjectUrl(
                        exercise._id,
                        headers,
                        signal
                    );

                    if (!fallbackImage) {
                        return exercise;
                    }

                    return {
                        ...exercise,
                        imageLink: fallbackImage,
                        level: exercises[index].level,
                    };
                })
            );

            return exercisesWithResolvedImages;
        },
    });
}
