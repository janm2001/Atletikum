const { QuizCompletion } = require("../models/QuizCompletion");
const { Article } = require("../models/Article");
const AppError = require("../utils/AppError");
const { scoreQuizSubmission } = require("../utils/quizScoring");
const { applyUserProgress } = require("./userProgressService");

const QUIZ_COOLDOWN_DAYS = 3;

const getCooldownEnd = (completedAt) => {
  const cooldownEnd = new Date(completedAt);
  cooldownEnd.setDate(cooldownEnd.getDate() + QUIZ_COOLDOWN_DAYS);
  return cooldownEnd;
};

const findLastCompletion = async ({ userId, articleId }) => {
  return QuizCompletion.findOne({
    user: userId,
    article: articleId,
  }).sort({ completedAt: -1 });
};

const buildQuizStatus = (lastCompletion) => {
  if (!lastCompletion) {
    return {
      canTakeQuiz: true,
      lastCompletion: null,
      nextAvailableAt: null,
    };
  }

  const cooldownEnd = getCooldownEnd(lastCompletion.completedAt);
  const canTakeQuiz = new Date() >= cooldownEnd;

  return {
    canTakeQuiz,
    lastCompletion: {
      score: lastCompletion.score,
      totalQuestions: lastCompletion.totalQuestions,
      xpGained: lastCompletion.xpGained,
      completedAt: lastCompletion.completedAt,
      passed:
        lastCompletion.passed ??
        lastCompletion.score / lastCompletion.totalQuestions >= 0.5,
    },
    nextAvailableAt: canTakeQuiz ? null : cooldownEnd,
  };
};

const getQuizStatus = async ({ userId, articleId }) => {
  const lastCompletion = await findLastCompletion({ userId, articleId });
  return buildQuizStatus(lastCompletion);
};

const submitQuiz = async ({ userId, articleId, submittedAnswers }) => {
  const article = await Article.findById(articleId).lean();

  if (!article || !Array.isArray(article.quiz) || article.quiz.length === 0) {
    throw new AppError("Kviz nije dostupan za ovaj članak.", 404);
  }

  const lastCompletion = await findLastCompletion({ userId, articleId });
  if (lastCompletion) {
    const cooldownEnd = getCooldownEnd(lastCompletion.completedAt);
    if (new Date() < cooldownEnd) {
      throw new AppError(
        `Kviz možete ponoviti nakon ${cooldownEnd.toLocaleDateString("hr-HR")}`,
        429,
        { nextAvailableAt: cooldownEnd },
      );
    }
  }

  const quizResult = scoreQuizSubmission(article.quiz, submittedAnswers);
  const completion = await QuizCompletion.create({
    user: userId,
    article: articleId,
    score: quizResult.score,
    totalQuestions: quizResult.totalQuestions,
    xpGained: quizResult.xpGained,
    passed: quizResult.passed,
    submittedAnswers: quizResult.submittedAnswers,
  });

  const progress = await applyUserProgress({
    userId,
    brainXp: quizResult.passed ? quizResult.xpGained : 0,
    shouldUpdateStreak: quizResult.passed,
    shouldUnlockAchievements: quizResult.passed,
  });

  const nextAvailableAt = getCooldownEnd(new Date());

  return {
    completion: {
      score: completion.score,
      totalQuestions: completion.totalQuestions,
      xpGained: completion.xpGained,
      completedAt: completion.completedAt,
      passed: completion.passed,
    },
    user: progress.user,
    newAchievements: progress.newAchievements,
    nextAvailableAt,
  };
};

const getMyCompletions = async ({ userId }) => {
  const completions = await QuizCompletion.find({ user: userId })
    .sort({ completedAt: -1 })
    .lean();

  const completedArticleIds = [
    ...new Set(completions.map((completion) => completion.article.toString())),
  ];

  return {
    completedArticleIds,
    completions,
  };
};

const getRevisionQuiz = async ({ userId }) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const oldCompletions = await QuizCompletion.find({
    user: userId,
    completedAt: { $lte: sevenDaysAgo },
  }).lean();

  if (oldCompletions.length === 0) {
    return null;
  }

  const random =
    oldCompletions[Math.floor(Math.random() * oldCompletions.length)];

  return {
    articleId: random.article,
    lastScore: random.score,
    totalQuestions: random.totalQuestions,
    completedAt: random.completedAt,
  };
};

module.exports = {
  getQuizStatus,
  submitQuiz,
  getMyCompletions,
  getRevisionQuiz,
};
