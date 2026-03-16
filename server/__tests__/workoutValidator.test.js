const {
  validateCreateWorkoutRequest,
  validateUpdateWorkoutRequest,
} = require("../validators/workoutValidator");

describe("workoutValidator", () => {
  const validExerciseId = "507f1f77bcf86cd799439011";
  const validWorkoutId = "507f1f77bcf86cd799439012";

  const createWorkoutRequest = () => ({
    body: {
      title: "Snaga nogu",
      requiredLevel: 2,
      exercises: [
        {
          exerciseId: validExerciseId,
          sets: 4,
          reps: "10",
          baseXp: 20,
          progression: {
            enabled: true,
            initialWeightKg: 20,
            incrementKg: 2.5,
          },
        },
      ],
    },
  });

  it("accepts a valid workout create payload", () => {
    expect(() => validateCreateWorkoutRequest(createWorkoutRequest())).not.toThrow();
  });

  it("rejects workout create payload with invalid exercise id", () => {
    const request = createWorkoutRequest();
    request.body.exercises[0].exerciseId = "invalid-id";

    expect(() => validateCreateWorkoutRequest(request)).toThrow(
      "exerciseId za vježbu 1 nije valjan.",
    );
  });

  it("rejects workout update payload with invalid workout id", () => {
    const request = {
      params: { id: "invalid-id" },
      body: { title: "Ažurirani trening" },
    };

    expect(() => validateUpdateWorkoutRequest(request)).toThrow(
      "ID treninga nije valjan.",
    );
  });

  it("rejects workout update payload with invalid tags type", () => {
    const request = {
      params: { id: validWorkoutId },
      body: { tags: "legs" },
    };

    expect(() => validateUpdateWorkoutRequest(request)).toThrow(
      "Tagovi moraju biti poslani kao polje.",
    );
  });
});
