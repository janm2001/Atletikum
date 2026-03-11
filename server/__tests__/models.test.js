const mongoose = require("mongoose");
const { userSchema } = require("../models/User");
const { articleSchema } = require("../models/Article");
const { exerciseSchema } = require("../models/Exercise");
const { workoutSchema } = require("../models/Workout");
const { workoutLogSchema } = require("../models/WorkoutLog");
const { quizCompletionSchema } = require("../models/QuizCompletion");
const { achievementSchema } = require("../models/Achievement");
const ArticleTag = require("../enums/ArticleTag.enum");
const MuscleGroup = require("../enums/MuscleGroup.enum");

function validate(schema, data) {
  const Model =
    mongoose.models["__Test_" + Date.now()] ||
    mongoose.model("__Test_" + Math.random(), schema);
  const doc = new Model(data);
  return doc.validateSync();
}

afterAll(async () => {
  for (const name of Object.keys(mongoose.models)) {
    if (name.startsWith("__Test_")) {
      delete mongoose.models[name];
      delete mongoose.modelSchemas?.[name];
    }
  }
});

describe("User schema", () => {
  const validUser = {
    username: "ivan",
    email: "ivan@example.com",
    password: "strongPass123",
    trainingFrequency: 4,
    focus: "snaga",
  };

  it("accepts a valid user", () => {
    expect(validate(userSchema, validUser)).toBeUndefined();
  });

  it("rejects without username", () => {
    const err = validate(userSchema, { ...validUser, username: undefined });
    expect(err.errors.username).toBeDefined();
  });

  it("rejects without email", () => {
    const err = validate(userSchema, { ...validUser, email: undefined });
    expect(err.errors.email).toBeDefined();
  });

  it("rejects invalid email", () => {
    const err = validate(userSchema, { ...validUser, email: "not-an-email" });
    expect(err.errors.email).toBeDefined();
  });

  it("rejects invalid focus enum", () => {
    const err = validate(userSchema, { ...validUser, focus: "speed" });
    expect(err.errors.focus).toBeDefined();
  });

  it("rejects trainingFrequency > 7", () => {
    const err = validate(userSchema, { ...validUser, trainingFrequency: 8 });
    expect(err.errors.trainingFrequency).toBeDefined();
  });

  it("rejects trainingFrequency < 0", () => {
    const err = validate(userSchema, { ...validUser, trainingFrequency: -1 });
    expect(err.errors.trainingFrequency).toBeDefined();
  });

  it("defaults level to 1", () => {
    const TestModel = mongoose.model(
      "__UserDefaults_" + Date.now(),
      userSchema,
    );
    const doc = new TestModel(validUser);
    expect(doc.level).toBe(1);
    expect(doc.totalXp).toBe(0);
    expect(doc.dailyStreak).toBe(0);
    expect(doc.role).toBe("user");
  });

  it("accepts valid role enum values", () => {
    expect(
      validate(userSchema, { ...validUser, role: "admin" }),
    ).toBeUndefined();
    expect(
      validate(userSchema, { ...validUser, role: "user" }),
    ).toBeUndefined();
  });

  it("rejects invalid role", () => {
    const err = validate(userSchema, { ...validUser, role: "superadmin" });
    expect(err.errors.role).toBeDefined();
  });
});

describe("Article schema", () => {
  const validArticle = {
    title: "Test Article",
    summary: "A summary",
    content: "<p>Content</p>",
    tag: ArticleTag.TRAINING,
  };

  it("accepts a valid article", () => {
    expect(validate(articleSchema, validArticle)).toBeUndefined();
  });

  it("accepts related article and exercise ids", () => {
    expect(
      validate(articleSchema, {
        ...validArticle,
        relatedArticleIds: [new mongoose.Types.ObjectId()],
        relatedExerciseIds: [new mongoose.Types.ObjectId()],
      }),
    ).toBeUndefined();
  });

  it("rejects without required fields", () => {
    const err = validate(articleSchema, {});
    expect(err.errors.title).toBeDefined();
    expect(err.errors.summary).toBeDefined();
    expect(err.errors.content).toBeDefined();
    expect(err.errors.tag).toBeDefined();
  });

  it("rejects invalid tag", () => {
    const err = validate(articleSchema, { ...validArticle, tag: "INVALID" });
    expect(err.errors.tag).toBeDefined();
  });

  it("accepts all valid ArticleTag values", () => {
    for (const tag of Object.values(ArticleTag)) {
      expect(validate(articleSchema, { ...validArticle, tag })).toBeUndefined();
    }
  });

  describe("quiz sub-document", () => {
    it("accepts valid quiz questions", () => {
      const article = {
        ...validArticle,
        quiz: [{ question: "Q1?", options: ["A", "B"], correctIndex: 0 }],
      };
      expect(validate(articleSchema, article)).toBeUndefined();
    });

    it("rejects quiz question with fewer than 2 options", () => {
      const article = {
        ...validArticle,
        quiz: [{ question: "Q?", options: ["A"], correctIndex: 0 }],
      };
      const err = validate(articleSchema, article);
      expect(err).toBeDefined();
    });

    it("rejects negative correctIndex", () => {
      const article = {
        ...validArticle,
        quiz: [{ question: "Q?", options: ["A", "B"], correctIndex: -1 }],
      };
      const err = validate(articleSchema, article);
      expect(err).toBeDefined();
    });

    it("rejects out-of-range correctIndex (upper bound validated)", () => {
      const article = {
        ...validArticle,
        quiz: [{ question: "Q?", options: ["A", "B"], correctIndex: 99 }],
      };
      const err = validate(articleSchema, article);
      expect(err).toBeDefined();
    });
  });
});

describe("Exercise schema", () => {
  const validExercise = {
    title: "Squat",
    description: "Barbell back squat",
    muscleGroup: MuscleGroup.QUADRICEPS,
    level: 1,
  };

  it("accepts a valid exercise", () => {
    expect(validate(exerciseSchema, validExercise)).toBeUndefined();
  });

  it("rejects level < 1", () => {
    const err = validate(exerciseSchema, { ...validExercise, level: 0 });
    expect(err.errors.level).toBeDefined();
  });

  it("rejects level > 100", () => {
    const err = validate(exerciseSchema, { ...validExercise, level: 101 });
    expect(err.errors.level).toBeDefined();
  });

  it("rejects invalid muscleGroup", () => {
    const err = validate(exerciseSchema, {
      ...validExercise,
      muscleGroup: "ARMS",
    });
    expect(err.errors.muscleGroup).toBeDefined();
  });

  it("accepts all valid MuscleGroup values", () => {
    for (const mg of Object.values(MuscleGroup)) {
      expect(
        validate(exerciseSchema, { ...validExercise, muscleGroup: mg }),
      ).toBeUndefined();
    }
  });
});

describe("Workout schema", () => {
  const validWorkout = {
    title: "Leg Day",
    description: "Lower body focus",
    requiredLevel: 1,
    exercises: [
      {
        exerciseId: new mongoose.Types.ObjectId(),
        sets: 3,
        reps: "10",
        rpe: "8",
        baseXp: 50,
      },
    ],
  };

  it("accepts a valid workout", () => {
    expect(validate(workoutSchema, validWorkout)).toBeUndefined();
  });

  it("rejects without title", () => {
    const err = validate(workoutSchema, { ...validWorkout, title: undefined });
    expect(err.errors.title).toBeDefined();
  });

  it("defaults requiredLevel to 1", () => {
    const TestModel = mongoose.model(
      "__WorkoutDefaults_" + Date.now(),
      workoutSchema,
    );
    const doc = new TestModel({ title: "Test" });
    expect(doc.requiredLevel).toBe(1);
  });

  it("rejects negative sets (min validation)", () => {
    const workout = {
      ...validWorkout,
      exercises: [
        {
          exerciseId: new mongoose.Types.ObjectId(),
          sets: -5,
          reps: "10",
          rpe: "8",
          baseXp: 50,
        },
      ],
    };
    const err = validate(workoutSchema, workout);
    expect(err).toBeDefined();
  });

  it("rejects negative baseXp (min validation)", () => {
    const workout = {
      ...validWorkout,
      exercises: [
        {
          exerciseId: new mongoose.Types.ObjectId(),
          sets: 3,
          reps: "10",
          rpe: "8",
          baseXp: -100,
        },
      ],
    };
    const err = validate(workoutSchema, workout);
    expect(err).toBeDefined();
  });
});

describe("WorkoutLog schema", () => {
  it("accepts a valid log", () => {
    const log = {
      user: "user123",
      workoutId: new mongoose.Types.ObjectId(),
      workout: "Leg Day",
      completedExercises: [
        {
          exerciseId: "ex1",
          metricType: "reps",
          unitLabel: "reps",
          resultValue: 10,
          loadKg: 80,
          rpe: 7,
        },
      ],
      totalXpGained: 150,
    };
    expect(validate(workoutLogSchema, log)).toBeUndefined();
  });

  it("rejects without user", () => {
    const err = validate(workoutLogSchema, { workout: "Test" });
    expect(err.errors.user).toBeDefined();
  });

  it("WARNING: user field is String, not ObjectId ref", () => {
    const path = workoutLogSchema.path("user");
    expect(path.instance).toBe("String");
  });

  it("WARNING: workout field is String (title), not ObjectId ref", () => {
    const path = workoutLogSchema.path("workout");
    expect(path.instance).toBe("String");
  });

  it("uses ObjectId ref for workoutId", () => {
    const path = workoutLogSchema.path("workoutId");
    expect(path.instance).toBe("ObjectId");
    expect(path.options.ref).toBe("Workout");
  });
});

describe("QuizCompletion schema", () => {
  it("accepts valid completion", () => {
    const data = {
      user: "user123",
      article: new mongoose.Types.ObjectId(),
      score: 3,
      totalQuestions: 5,
    };
    expect(validate(quizCompletionSchema, data)).toBeUndefined();
  });

  it("WARNING: user is plain String, not ObjectId", () => {
    const path = quizCompletionSchema.path("user");
    expect(path.instance).toBe("String");
  });

  it("article is a proper ObjectId ref", () => {
    const path = quizCompletionSchema.path("article");
    expect(path.instance).toBe("ObjectId");
  });
});

describe("Achievement schema", () => {
  const validAchievement = {
    key: "first_workout",
    title: "First Workout",
    description: "Complete your first workout",
    xpReward: 50,
    category: "milestone",
    trigger: "workout_count",
    threshold: 1,
  };

  it("accepts a valid achievement", () => {
    expect(validate(achievementSchema, validAchievement)).toBeUndefined();
  });

  it("rejects invalid category", () => {
    const err = validate(achievementSchema, {
      ...validAchievement,
      category: "legendary",
    });
    expect(err.errors.category).toBeDefined();
  });

  it("rejects invalid trigger", () => {
    const err = validate(achievementSchema, {
      ...validAchievement,
      trigger: "flying",
    });
    expect(err.errors.trigger).toBeDefined();
  });

  it("accepts all valid trigger types", () => {
    const triggers = [
      "workout_count",
      "quiz_count",
      "xp_threshold",
      "streak",
      "level",
      "perfect_quiz",
      "same_day_both",
    ];
    for (const trigger of triggers) {
      expect(
        validate(achievementSchema, { ...validAchievement, trigger }),
      ).toBeUndefined();
    }
  });

  it("accepts all valid xpCategory values", () => {
    for (const xpCategory of ["brain", "body", "both"]) {
      expect(
        validate(achievementSchema, { ...validAchievement, xpCategory }),
      ).toBeUndefined();
    }
  });
});

describe("Cross-model consistency", () => {
  it("User.focus enum matches client-side TrainingFocus values", () => {
    const focusPath = userSchema.path("focus");
    const serverEnums = focusPath.enumValues;
    // These must match the client TrainingFocus enum values
    expect(serverEnums).toEqual(
      expect.arrayContaining(["mobilnost", "snaga", "prevencija_ozlijede"]),
    );
    expect(serverEnums).toHaveLength(3);
  });

  it("Exercise.muscleGroup enum matches MuscleGroup enum", () => {
    const path = exerciseSchema.path("muscleGroup");
    expect(path.enumValues.sort()).toEqual(Object.values(MuscleGroup).sort());
  });

  it("Article.tag enum matches ArticleTag enum", () => {
    const path = articleSchema.path("tag");
    expect(path.enumValues.sort()).toEqual(Object.values(ArticleTag).sort());
  });

  it("Workout.exercises.exerciseId is an ObjectId ref to Exercise", () => {
    const exercisesSchema = workoutSchema.path("exercises");
    const subSchema = exercisesSchema.schema;
    const exerciseIdPath = subSchema.path("exerciseId");
    expect(exerciseIdPath.instance).toBe("ObjectId");
    expect(exerciseIdPath.options.ref).toBe("Exercise");
  });

  it("User.achievements.achievement is an ObjectId ref to Achievement", () => {
    const achievementsSchema = userSchema.path("achievements");
    const subSchema = achievementsSchema.schema;
    const achievementPath = subSchema.path("achievement");
    expect(achievementPath.instance).toBe("ObjectId");
    expect(achievementPath.options.ref).toBe("Achievement");
  });
});
