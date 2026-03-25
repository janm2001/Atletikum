const { Workout } = require("../models/Workout");
const { Article } = require("../models/Article");
const { WorkoutLog } = require("../models/WorkoutLog");
const { QuizCompletion } = require("../models/QuizCompletion");
const { Exercise } = require("../models/Exercise");
const articleService = require("./articleService");
const { requireUserId } = require("../utils/userIdentity");
const {
  buildRevisionEligibilityFilter,
  selectOldestEligibleRevisionCompletion,
} = require("../utils/quizTiming");
const {
  summarizePersonalBests,
  buildNextSessionSuggestions,
} = require("../utils/workoutMetrics");

const FOCUS_CONFIG = {
  mobilnost: {
    workoutTags: ["MOBILITY", "RECOVERY", "CORE"],
    articleTags: ["RECOVERY", "BIOMECHANICS", "TRAINING"],
    reason: "Fokus je na mobilnosti i kvaliteti pokreta.",
  },
  snaga: {
    workoutTags: ["STRENGTH", "PLYOMETRICS", "CORE"],
    articleTags: ["TRAINING", "PHYSIOLOGY", "PERIODIZATION"],
    reason: "Fokus je na snazi i progresivnom opterećenju.",
  },
  prevencija_ozlijede: {
    workoutTags: ["RECOVERY", "MOBILITY", "CORE"],
    articleTags: ["RECOVERY", "BIOMECHANICS", "PSYCHOLOGY"],
    reason: "Fokus je na oporavku i prevenciji ozljede.",
  },
};

const getDifficultiesForLevel = (level) => {
  if (level <= 4) return ["beginner", "intermediate"];
  if (level <= 8) return ["beginner", "intermediate", "advanced"];
  return ["intermediate", "advanced"];
};

const WORKOUT_LOG_PROJECTION = {
  date: 1,
  workoutId: 1,
  workout: 1,
  readinessScore: 1,
  sessionFeedbackScore: 1,
  completedExercises: 1,
};

const REVISION_COMPLETION_PROJECTION = {
  article: 1,
  score: 1,
  totalQuestions: 1,
  completedAt: 1,
};

const REVISION_LOOKUP_LIMIT = 12;

const getRevisionRecommendation = async (userId) => {
  const oldCompletions = await QuizCompletion.find(
    buildRevisionEligibilityFilter({ userId }),
    REVISION_COMPLETION_PROJECTION,
  )
    .sort({ completedAt: 1 })
    .limit(REVISION_LOOKUP_LIMIT)
    .lean();

  if (oldCompletions.length === 0) {
    return null;
  }

  const candidateArticleIds = [
    ...new Set(
      oldCompletions
        .map((completion) => completion?.article)
        .filter(Boolean)
        .map((articleId) => String(articleId)),
    ),
  ];

  if (candidateArticleIds.length === 0) {
    return null;
  }

  const availableRevisionArticles = await Article.find(
    {
      _id: { $in: candidateArticleIds },
      "quiz.0": { $exists: true },
    },
    { _id: 1 },
  ).lean();

  const availableArticleIds = new Set(
    availableRevisionArticles.map((article) => String(article._id)),
  );

  const revision = selectOldestEligibleRevisionCompletion(
    oldCompletions.filter((completion) =>
      availableArticleIds.has(String(completion.article)),
    ),
  );

  if (!revision) {
    return null;
  }

  return {
    articleId: String(revision.article),
    lastScore: revision.score,
    totalQuestions: revision.totalQuestions,
    completedAt: revision.completedAt,
  };
};

const calculateReadiness = (recentLogs) => {
  const readinessScores = recentLogs
    .map((log) => Number(log.readinessScore))
    .filter((value) => Number.isFinite(value));
  const feedbackScores = recentLogs
    .map((log) => Number(log.sessionFeedbackScore))
    .filter((value) => Number.isFinite(value));

  const averageReadiness =
    readinessScores.length > 0
      ? readinessScores.reduce((sum, value) => sum + value, 0) /
        readinessScores.length
      : 3;
  const averageFeedback =
    feedbackScores.length > 0
      ? feedbackScores.reduce((sum, value) => sum + value, 0) /
        feedbackScores.length
      : 3;

  return {
    averageReadiness,
    averageFeedback,
    lowReadiness: averageReadiness < 3 || averageFeedback < 3,
  };
};

const getCompletedThisWeek = (recentLogs) => {
  return recentLogs.filter((log) => {
    const createdAt = new Date(log.date ?? 0);
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;
};

const buildExerciseNameById = async ({ availableWorkouts, recentLogs }) => {
  const exerciseNameById = new Map();
  const missingExerciseIds = new Set();

  const registerExerciseName = (exerciseId, title) => {
    const normalizedExerciseId = String(exerciseId ?? "");
    if (!normalizedExerciseId) {
      return;
    }

    if (title) {
      exerciseNameById.set(normalizedExerciseId, title);
      missingExerciseIds.delete(normalizedExerciseId);
      return;
    }

    if (!exerciseNameById.has(normalizedExerciseId)) {
      missingExerciseIds.add(normalizedExerciseId);
    }
  };

  availableWorkouts.forEach((workout) => {
    (workout.exercises ?? []).forEach((exercise) => {
      const exerciseReference = exercise.exerciseId;
      registerExerciseName(
        exerciseReference?._id ?? exerciseReference,
        exerciseReference?.title,
      );
    });
  });

  recentLogs.forEach((log) => {
    (log.completedExercises ?? []).forEach((exercise) => {
      registerExerciseName(exercise.exerciseId);
    });
  });

  if (missingExerciseIds.size === 0) {
    return exerciseNameById;
  }

  const exerciseDocs = await Exercise.find(
    { _id: { $in: [...missingExerciseIds] } },
    { title: 1 },
  ).lean();

  exerciseDocs.forEach((exercise) => {
    exerciseNameById.set(String(exercise._id), exercise.title);
  });

  return exerciseNameById;
};

const getWeeklyRecommendations = async ({ user, userId }) => {
  const normalizedUserId = requireUserId({ userId, user });
  const focusConfig = FOCUS_CONFIG[user.focus] ?? FOCUS_CONFIG.snaga;

  const recentLogsQuery = WorkoutLog.find(
    { user: normalizedUserId },
    WORKOUT_LOG_PROJECTION,
  )
    .sort({ date: -1 })
    .limit(8)
    .lean();
  const completedQuizArticleIdsQuery = QuizCompletion.distinct("article", {
    user: normalizedUserId,
  });
  const availableWorkoutsQuery = Workout.find({
    requiredLevel: { $lte: user.level },
    $or: [{ createdBy: null }, { createdBy: normalizedUserId }],
  })
    .populate("exercises.exerciseId", "title imageLink")
    .lean();

  const [recentLogs, completedQuizArticleIds, availableWorkouts] =
    await Promise.all([
      recentLogsQuery,
      completedQuizArticleIdsQuery,
      availableWorkoutsQuery,
    ]);

  const completedArticleIds = new Set(
    completedQuizArticleIds.map((articleId) => String(articleId)),
  );
  const recentWorkoutIds = new Set(
    recentLogs
      .map((log) => (log.workoutId ? String(log.workoutId) : null))
      .filter(Boolean),
  );

  const exerciseNameByIdPromise = buildExerciseNameById({
    availableWorkouts,
    recentLogs,
  });
  const revisionPromise = getRevisionRecommendation(normalizedUserId);
  const enrichedRecommendedArticlesPromise = (async () => {
    const appropriateDifficulties = getDifficultiesForLevel(user.level);

    const recommendedArticles = await Article.find({
      tag: { $in: focusConfig.articleTags },
      difficulty: { $in: appropriateDifficulties },
      _id: { $nin: [...completedArticleIds] },
    })
      .select("-quiz")
      .sort({ sequenceOrder: 1, createdAt: -1 })
      .limit(3)
      .lean();

    const bookmarkMap = await articleService.getBookmarkMap(
      normalizedUserId,
      recommendedArticles.map((article) => article._id),
    );

    return articleService.attachBookmarkState(recommendedArticles, bookmarkMap);
  })();

  const readiness = calculateReadiness(recentLogs);
  const recommendedWorkouts = availableWorkouts
    .map((workout) => {
      const tags = workout.tags ?? [];
      let score = 0;

      if (focusConfig.workoutTags.some((tag) => tags.includes(tag))) {
        score += 4;
      }
      if (!recentWorkoutIds.has(String(workout._id))) {
        score += 2;
      }
      if (readiness.lowReadiness && tags.includes("RECOVERY")) {
        score += 4;
      }
      score += Math.max(
        0,
        4 - Math.abs((workout.requiredLevel ?? 1) - user.level),
      );

      return { ...workout, _recommendationScore: score };
    })
    .sort(
      (left, right) => right._recommendationScore - left._recommendationScore,
    )
    .slice(0, Math.max(1, Math.min(user.trainingFrequency || 3, 3)));

  const [exerciseNameById, revision, enrichedRecommendedArticles] =
    await Promise.all([
      exerciseNameByIdPromise,
      revisionPromise,
      enrichedRecommendedArticlesPromise,
    ]);
  const personalBestSummaries = summarizePersonalBests(
    recentLogs,
    exerciseNameById,
  ).slice(0, 4);
  const nextSessionSuggestions = buildNextSessionSuggestions({
    recommendedWorkouts,
    workoutLogs: recentLogs,
    readinessScore: readiness.averageReadiness,
    feedbackScore: readiness.averageFeedback,
    exerciseNameById,
  });

  return {
    workouts: recommendedWorkouts,
    articles: enrichedRecommendedArticles,
    revision,
    personalBestSummaries,
    nextSessionSuggestions,
    insight: {
      focusReason: focusConfig.reason,
      lowReadiness: readiness.lowReadiness,
      readinessScore: Number(readiness.averageReadiness.toFixed(1)),
      feedbackScore: Number(readiness.averageFeedback.toFixed(1)),
      completedThisWeek: getCompletedThisWeek(recentLogs),
      weeklyTarget: user.trainingFrequency,
    },
  };
};

module.exports = {
  getWeeklyRecommendations,
};
