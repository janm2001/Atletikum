import { describe, it, expect } from "vitest";
import {
  getExerciseName,
  getExerciseImage,
  getExerciseId,
} from "../types/Workout/workout";

describe("Workout type helpers", () => {
  const populated = {
    _id: "ex123",
    title: "Squat",
    imageLink: "https://example.com/squat.jpg",
  };

  describe("getExerciseName", () => {
    it("returns title from populated exercise", () => {
      expect(getExerciseName(populated)).toBe("Squat");
    });

    it("returns undefined for plain string id", () => {
      expect(getExerciseName("ex123")).toBeUndefined();
    });

    it("returns undefined for null", () => {
      expect(getExerciseName(null)).toBeUndefined();
    });
  });

  describe("getExerciseImage", () => {
    it("returns imageLink from populated exercise", () => {
      expect(getExerciseImage(populated)).toBe(
        "https://example.com/squat.jpg",
      );
    });

    it("returns undefined for string id", () => {
      expect(getExerciseImage("ex123")).toBeUndefined();
    });

    it("returns undefined for populated exercise without imageLink", () => {
      expect(getExerciseImage({ _id: "x", title: "T" })).toBeUndefined();
    });
  });

  describe("getExerciseId", () => {
    it("returns _id from populated exercise", () => {
      expect(getExerciseId(populated)).toBe("ex123");
    });

    it("returns string id as-is", () => {
      expect(getExerciseId("plain-id")).toBe("plain-id");
    });

    it("returns empty string for null", () => {
      expect(getExerciseId(null)).toBe("");
    });
  });
});
