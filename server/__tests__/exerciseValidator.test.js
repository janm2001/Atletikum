const {
  validateCreateExerciseRequest,
  validateUpdateExerciseRequest,
} = require("../validators/exerciseValidator");

describe("exerciseValidator", () => {
  const validExerciseId = "507f1f77bcf86cd799439011";

  it("accepts a valid create payload", () => {
    const request = {
      body: {
        title: "Čučanj",
        description: "Osnovna vježba za noge",
        muscleGroup: "QUADRICEPS",
        level: 10,
      },
    };

    expect(() => validateCreateExerciseRequest(request)).not.toThrow();
  });

  it("rejects create payload with invalid muscle group", () => {
    const request = {
      body: {
        title: "Čučanj",
        description: "Opis",
        muscleGroup: "CHEST",
        level: 10,
      },
    };

    expect(() => validateCreateExerciseRequest(request)).toThrow(
      "Mišićna skupina nije valjana.",
    );
  });

  it("rejects update payload with invalid id", () => {
    const request = {
      params: { id: "invalid-id" },
      body: { title: "Nova vježba" },
    };

    expect(() => validateUpdateExerciseRequest(request)).toThrow(
      "ID vježbe nije valjan.",
    );
  });

  it("rejects update payload with out of range level", () => {
    const request = {
      params: { id: validExerciseId },
      body: { level: 150 },
    };

    expect(() => validateUpdateExerciseRequest(request)).toThrow(
      "Razina vježbe mora biti između 1 i 100.",
    );
  });
});
