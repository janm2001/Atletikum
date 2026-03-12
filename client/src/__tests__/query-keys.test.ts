import { describe, expect, it } from "vitest";
import { keys } from "../lib/query-keys";

describe("query keys", () => {
  it("keeps article list keys scoped under a dedicated list root", () => {
    expect(keys.knowledgeBase.list()).toEqual(["articles", "list", "all"]);
    expect(keys.knowledgeBase.saved(["RECOVERY"])).toEqual([
      "articles",
      "list",
      "saved",
      "RECOVERY",
    ]);
    expect(keys.knowledgeBase.details()).toEqual(["articles", "detail"]);
  });

  it("scopes workout and workout log list keys separately from their roots", () => {
    expect(keys.workouts.lists()).toEqual(["workouts", "list"]);
    expect(keys.workouts.list("mine")).toEqual(["workouts", "list", "mine"]);
    expect(keys.workoutLogs.list()).toEqual(["workout-logs", "list"]);
  });
});
