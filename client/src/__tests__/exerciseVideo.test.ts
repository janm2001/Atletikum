import { describe, expect, it } from "vitest";
import { getExerciseVideo } from "@/utils/exerciseVideo";

describe("exercise video URLs", () => {
  it("creates a privacy-enhanced YouTube embed without accepting extra query parameters", () => {
    expect(getExerciseVideo("https://youtu.be/abcdefghijk?autoplay=1")).toMatchObject({ kind: "embed", url: "https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0" });
    expect(getExerciseVideo("https://www.youtube.com/watch?v=abcdefghijk")).toMatchObject({ kind: "embed" });
  });
  it("supports Vimeo privacy hashes and direct video files", () => {
    expect(getExerciseVideo("https://vimeo.com/12345/abcde")).toMatchObject({ kind: "embed", url: "https://player.vimeo.com/video/12345?dnt=1&h=abcde" });
    expect(getExerciseVideo("https://example.org/exercise.mp4?token=example")).toMatchObject({ kind: "video" });
  });
  it.each(["javascript:alert(1)", "data:text/html,test", "http://example.org/a.mp4", "https://user:pass@example.org/a.mp4", "broken", undefined])("rejects unsafe or invalid URL %s", (url) => {
    expect(getExerciseVideo(url)).toBeNull();
  });
  it("never embeds lookalike domains as YouTube", () => {
    expect(getExerciseVideo("https://youtube.com.evil.example/watch?v=abcdefghijk")).toMatchObject({ kind: "link" });
  });
});
