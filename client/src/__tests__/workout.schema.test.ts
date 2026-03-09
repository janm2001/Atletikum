import { describe, it, expect } from "vitest";
import { workoutSchema } from "../schema/workout.schema";

describe("workoutSchema", () => {
    const validWorkout = {
        title: "Leg Day",
        description: "Lower body workout",
        requiredLevel: 1,
        exercises: [
            { exerciseId: "abc123", sets: 3, reps: "10", rpe: "8", baseXp: 50 },
        ],
    };

    it("accepts a valid workout", () => {
        const result = workoutSchema.safeParse(validWorkout);
        expect(result.success).toBe(true);
    });

    it("rejects empty title", () => {
        const result = workoutSchema.safeParse({ ...validWorkout, title: "" });
        expect(result.success).toBe(false);
    });

    it("rejects requiredLevel < 1", () => {
        const result = workoutSchema.safeParse({
            ...validWorkout,
            requiredLevel: 0,
        });
        expect(result.success).toBe(false);
    });

    it("rejects negative baseXp", () => {
        const result = workoutSchema.safeParse({
            ...validWorkout,
            exercises: [
                { exerciseId: "abc", sets: 3, reps: "10", rpe: "8", baseXp: -1 },
            ],
        });
        expect(result.success).toBe(false);
    });

    it("rejects sets < 1", () => {
        const result = workoutSchema.safeParse({
            ...validWorkout,
            exercises: [
                { exerciseId: "abc", sets: 0, reps: "10", rpe: "8", baseXp: 50 },
            ],
        });
        expect(result.success).toBe(false);
    });

    it("rejects empty exerciseId", () => {
        const result = workoutSchema.safeParse({
            ...validWorkout,
            exercises: [
                { exerciseId: "", sets: 3, reps: "10", rpe: "8", baseXp: 50 },
            ],
        });
        expect(result.success).toBe(false);
    });

    it("accepts workout with empty exercises array", () => {
        const result = workoutSchema.safeParse({
            ...validWorkout,
            exercises: [],
        });
        expect(result.success).toBe(true);
    });

    it("accepts workout with empty description", () => {
        const result = workoutSchema.safeParse({
            ...validWorkout,
            description: "",
        });
        expect(result.success).toBe(true);
    });
});
