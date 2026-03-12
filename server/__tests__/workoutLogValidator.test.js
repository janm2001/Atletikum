const {
  validateCreateWorkoutLogRequest,
} = require("../validators/workoutLogValidator");

describe("workoutLogValidator", () => {
  const validWorkoutId = "507f1f77bcf86cd799439011";

  const createRequest = () => ({
    body: {
      workoutId: validWorkoutId,
      completedExercises: [
        {
          exerciseId: "exercise-1",
          resultValue: 8,
          rpe: 7,
          loadKg: 50,
        },
      ],
    },
  });

  it("rejects invalid workout ids", () => {
    const request = createRequest();
    request.body.workoutId = "invalid-id";

    expect(() => validateCreateWorkoutLogRequest(request)).toThrow(
      "Workout nije valjan.",
    );
  });

  it("rejects invalid result values and rpe ranges", () => {
    const invalidResultRequest = createRequest();
    invalidResultRequest.body.completedExercises[0].resultValue = 0;

    expect(() => validateCreateWorkoutLogRequest(invalidResultRequest)).toThrow(
      "Rezultat za vježbu 1 mora biti veći od 0.",
    );

    const invalidRpeRequest = createRequest();
    invalidRpeRequest.body.completedExercises[0].rpe = 11;

    expect(() => validateCreateWorkoutLogRequest(invalidRpeRequest)).toThrow(
      "RPE za vježbu 1 mora biti između 1 i 10.",
    );
  });

  it("allows empty load values but rejects negative load", () => {
    const emptyLoadRequest = createRequest();
    emptyLoadRequest.body.completedExercises[0].loadKg = "";

    expect(() => validateCreateWorkoutLogRequest(emptyLoadRequest)).not.toThrow();

    const negativeLoadRequest = createRequest();
    negativeLoadRequest.body.completedExercises[0].loadKg = -5;

    expect(() => validateCreateWorkoutLogRequest(negativeLoadRequest)).toThrow(
      "Opterećenje za vježbu 1 ne može biti negativno.",
    );
  });
});
