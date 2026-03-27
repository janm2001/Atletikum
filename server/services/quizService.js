const { QuizCompletion } = require("../models/QuizCompletion");
const { QuizCooldown } = require("../models/QuizCooldown");
const { Article } = require("../models/Article");
const AppError = require("../utils/AppError");
const {
  buildRevisionEligibilityFilter,
  getQuizCooldownEnd,
  selectRandomEligibleRevisionCompletion,
  getCooldownDays,
  getNextCooldownLevel,
  getXpMultiplier,
  MASTERY_THRESHOLD,
} = require("../utils/quizTiming");
const {
  attachSession,
  createWithSession,
  runInTransaction,
} = require("../utils/mongoTransaction");
const { scoreQuizSubmission } = require("../utils/quizScoring");
const { requireUserId } = require("../utils/userIdentity");
const { applyUserProgress } = require("./userProgressService");
const { updateChallengeProgress } = require("./weeklyChallengeService");
const QUIZ_SCORING_ERROR_MESSAGES = new Set([
  "Odgovori kviza moraju biti poslani kao polje.",
  "Broj odgovora mora odgovarati broju pitanja.",
  "Svaki odgovor mora biti važeći indeks opcije.",
  "Odgovor sadrži nevažeću opciju.",
]);

const findLastCompletion = ({ userId, articleId, session = null }) =>
  attachSession(
    QuizCompletion.findOne({
      user: userId,
      article: articleId,
    }).sort({ completedAt: -1 }),
    session,
  );

const buildQuizCooldownError = (nextAvailableAt) =>
  new AppError(
    `Kviz možete ponoviti nakon ${nextAvailableAt.toLocaleDateString("hr-HR")}`,
    429,
    { nextAvailableAt },
  );

const buildRetryableQuizReservationConflict = () => {
  const retryableConflictError = new Error(
    "Quiz cooldown reservation conflicted with another submission.",
  );
  retryableConflictError.code = 112;
  retryableConflictError.codeName = "WriteConflict";
  return retryableConflictError;
};

const reserveQuizAttempt = async ({
  userId,
  articleId,
  now,
  session,
  lastCompletion = null,
}) => {
  const nextAvailableAt = getQuizCooldownEnd(now);

  if (lastCompletion) {
    const legacyCooldownEnd = getQuizCooldownEnd(lastCompletion.completedAt);

    if (now < legacyCooldownEnd) {
      try {
        await attachSession(
          QuizCooldown.findOneAndUpdate(
            { user: userId, article: articleId },
            {
              $set: { nextAvailableAt: legacyCooldownEnd },
              $setOnInsert: {
                user: userId,
                article: articleId,
              },
            },
            { returnDocument: "after", upsert: true, runValidators: true },
          ),
          session,
        );
      } catch (error) {
        if (error?.code === 11000) {
          throw buildRetryableQuizReservationConflict();
        }

        throw error;
      }

      throw buildQuizCooldownError(legacyCooldownEnd);
    }
  }

  try {
    await attachSession(
      QuizCooldown.findOneAndUpdate(
        {
          user: userId,
          article: articleId,
          $or: [
            { nextAvailableAt: { $exists: false } },
            { nextAvailableAt: null },
            { nextAvailableAt: { $lte: now } },
          ],
        },
        {
          $set: { nextAvailableAt },
          $setOnInsert: {
            user: userId,
            article: articleId,
          },
        },
        { returnDocument: "after", upsert: true, runValidators: true },
      ),
      session,
    );

    return nextAvailableAt;
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const existingCooldown = await attachSession(
      QuizCooldown.findOne({ user: userId, article: articleId }).lean(),
      session,
    );

    if (existingCooldown?.nextAvailableAt && now < existingCooldown.nextAvailableAt) {
      throw buildQuizCooldownError(existingCooldown.nextAvailableAt);
    }

    throw buildRetryableQuizReservationConflict();
  }
};

const buildQuizStatus = (lastCompletion) => {
  if (!lastCompletion) {
    return {
      canTakeQuiz: true,
      lastCompletion: null,
      nextAvailableAt: null,
    };
  }

  const cooldownEnd = getQuizCooldownEnd(lastCompletion.completedAt);
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
  const normalizedUserId = requireUserId({ userId });
  const lastCompletion = await findLastCompletion({
    userId: normalizedUserId,
    articleId,
  });
  return buildQuizStatus(lastCompletion);
};

const buildInvalidQuizSubmissionError = (message) =>
  new AppError(message, 400);

const scoreSubmission = ({ quiz, submittedAnswers }) => {
  try {
    return scoreQuizSubmission(quiz, submittedAnswers);
  } catch (error) {
    if (QUIZ_SCORING_ERROR_MESSAGES.has(error?.message)) {
      throw buildInvalidQuizSubmissionError(error.message);
    }

    throw error;
  }
};

const submitQuiz = async ({ userId, articleId, submittedAnswers }) => {
  const normalizedUserId = requireUserId({ userId });

  return runInTransaction(async (session) => {
    const article = await attachSession(Article.findById(articleId).lean(), session);

    if (!article || !Array.isArray(article.quiz) || article.quiz.length === 0) {
      throw new AppError("Kviz nije dostupan za ovaj članak.", 404);
    }

    const lastCompletion = await findLastCompletion({
      userId: normalizedUserId,
      articleId,
      session,
    });

    const now = new Date();
    const nextAvailableAt = await reserveQuizAttempt({
      userId: normalizedUserId,
      articleId,
      now,
      session,
      lastCompletion,
    });

    const quizResult = scoreSubmission({
      quiz: article.quiz,
      submittedAnswers,
    });
    const completion = await createWithSession(
      QuizCompletion,
      {
        user: normalizedUserId,
        article: articleId,
        score: quizResult.score,
        totalQuestions: quizResult.totalQuestions,
        xpGained: quizResult.xpGained,
        passed: quizResult.passed,
        submittedAnswers: quizResult.submittedAnswers,
      },
      session,
    );

    const progress = await applyUserProgress({
      userId: normalizedUserId,
      brainXp: quizResult.xpGained,
      shouldUpdateStreak: quizResult.passed,
      shouldUnlockAchievements: quizResult.passed,
      session,
      source: "quiz",
      sourceEntityId: articleId,
      description: `Quiz ${quizResult.passed ? "passed" : "failed"}: ${quizResult.score}/${quizResult.totalQuestions}`,
    });

    await updateChallengeProgress({ userId: normalizedUserId, type: "quiz", session });

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
  });
};

const getMyCompletions = async ({ userId }) => {
  const normalizedUserId = requireUserId({ userId });
  const completions = await QuizCompletion.find({ user: normalizedUserId })
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
  const normalizedUserId = requireUserId({ userId });
  const oldCompletions = await QuizCompletion.find(
    buildRevisionEligibilityFilter({ userId: normalizedUserId }),
  ).lean();

  if (oldCompletions.length === 0) {
    return null;
  }

  const random = selectRandomEligibleRevisionCompletion(oldCompletions);

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
