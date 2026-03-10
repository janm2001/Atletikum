const { Workout } = require("../models/Workout");
const { Article } = require("../models/Article");
const { WorkoutLog } = require("../models/WorkoutLog");
const { QuizCompletion } = require("../models/QuizCompletion");

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

const getRevisionRecommendation = async (userId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const oldCompletions = await QuizCompletion.find({
    user: userId,
    completedAt: { $lte: sevenDaysAgo },
  })
    .sort({ completedAt: 1 })
    .lean();

  if (oldCompletions.length === 0) {
    return null;
  }

  const revision = oldCompletions[0];
  return {
    articleId: String(revision.article),
    lastScore: revision.score,
    totalQuestions: revision.totalQuestions,
    completedAt: revision.completedAt,
  };
};

exports.getWeeklyRecommendations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const focusConfig = FOCUS_CONFIG[req.user.focus] ?? FOCUS_CONFIG.snaga;
    const recentLogs = await WorkoutLog.find({ user: userId })
      .sort({ date: -1 })
      .limit(8)
      .lean();
    const completedQuizzes = await QuizCompletion.find({ user: userId })
      .sort({ completedAt: -1 })
      .lean();
    const availableWorkouts = await Workout.find({
      requiredLevel: { $lte: req.user.level },
    })
      .populate("exercises.exerciseId", "title imageLink")
      .lean();

    const completedArticleIds = new Set(
      completedQuizzes.map((completion) => String(completion.article)),
    );
    const recentWorkoutIds = new Set(
      recentLogs
        .map((log) => (log.workoutId ? String(log.workoutId) : null))
        .filter(Boolean),
    );
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
    const lowReadiness = averageReadiness < 3 || averageFeedback < 3;

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
        if (lowReadiness && tags.includes("RECOVERY")) {
          score += 4;
        }
        score += Math.max(
          0,
          4 - Math.abs((workout.requiredLevel ?? 1) - req.user.level),
        );

        return { ...workout, _recommendationScore: score };
      })
      .sort(
        (left, right) => right._recommendationScore - left._recommendationScore,
      )
      .slice(0, Math.max(1, Math.min(req.user.trainingFrequency || 3, 3)));

    const recommendedArticles = await Article.find({
      tag: { $in: focusConfig.articleTags },
      _id: { $nin: [...completedArticleIds] },
    })
      .select("-quiz")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const revision = await getRevisionRecommendation(userId);
    const completedThisWeek = recentLogs.filter((log) => {
      const createdAt = new Date(log.date ?? 0);
      const now = new Date();
      const diff = now.getTime() - createdAt.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    res.status(200).json({
      status: "success",
      data: {
        workouts: recommendedWorkouts,
        articles: recommendedArticles,
        revision,
        insight: {
          focusReason: focusConfig.reason,
          lowReadiness,
          readinessScore: Number(averageReadiness.toFixed(1)),
          feedbackScore: Number(averageFeedback.toFixed(1)),
          completedThisWeek,
          weeklyTarget: req.user.trainingFrequency,
        },
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
