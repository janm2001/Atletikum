const { QuizCompletion } = require("../models/QuizCompletion");
const { Article } = require("../models/Article");
const { User } = require("../models/User");
const { getLevelFromTotalXp } = require("../utils/leveling");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { checkAndUnlockAchievements } = require("../utils/achievementChecker");
const { updateDailyStreak } = require("../utils/updateDailyStreak");
const { scoreQuizSubmission } = require("../utils/quizScoring");

const QUIZ_COOLDOWN_DAYS = 3;

exports.getQuizStatus = async (req, res) => {
  try {
    const lastCompletion = await QuizCompletion.findOne({
      user: req.user._id.toString(),
      article: req.params.articleId,
    }).sort({ completedAt: -1 });

    if (!lastCompletion) {
      return res.status(200).json({
        canTakeQuiz: true,
        lastCompletion: null,
        nextAvailableAt: null,
      });
    }

    const cooldownEnd = new Date(lastCompletion.completedAt);
    cooldownEnd.setDate(cooldownEnd.getDate() + QUIZ_COOLDOWN_DAYS);

    const canTakeQuiz = new Date() >= cooldownEnd;

    res.status(200).json({
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
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { submittedAnswers } = req.body;
    const userId = req.user._id.toString();
    const article = await Article.findById(articleId).lean();

    if (!article || !Array.isArray(article.quiz) || article.quiz.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Kviz nije dostupan za ovaj članak.",
      });
    }

    // --- Cooldown check ---
    const lastCompletion = await QuizCompletion.findOne({
      user: userId,
      article: articleId,
    }).sort({ completedAt: -1 });

    if (lastCompletion) {
      const cooldownEnd = new Date(lastCompletion.completedAt);
      cooldownEnd.setDate(cooldownEnd.getDate() + QUIZ_COOLDOWN_DAYS);

      if (new Date() < cooldownEnd) {
        return res.status(429).json({
          status: "fail",
          message: `Kviz možete ponoviti nakon ${cooldownEnd.toLocaleDateString("hr-HR")}`,
          nextAvailableAt: cooldownEnd,
        });
      }
    }

    const { score, totalQuestions, passed, xpGained } = scoreQuizSubmission(
      article.quiz,
      submittedAnswers,
    );

    // --- Save completion ---
    const completion = await QuizCompletion.create({
      user: userId,
      article: articleId,
      score,
      totalQuestions,
      xpGained,
      passed,
      submittedAnswers,
    });

    const updatedUser = await User.findById(req.user._id);
    if (updatedUser && passed) {
      updatedUser.brainXp += xpGained;
      updatedUser.totalXp = updatedUser.brainXp + updatedUser.bodyXp;
      updatedUser.level = getLevelFromTotalXp(updatedUser.totalXp);
      await updatedUser.save();
    }

    if (passed) {
      await updateDailyStreak(req.user._id);
    }

    const newAchievements = passed
      ? await checkAndUnlockAchievements(req.user._id.toString())
      : [];

    const cooldownEnd = new Date();
    cooldownEnd.setDate(cooldownEnd.getDate() + QUIZ_COOLDOWN_DAYS);

    const freshUser = await User.findById(req.user._id);

    res.status(201).json({
      status: "success",
      data: {
        completion: {
          score: completion.score,
          totalQuestions: completion.totalQuestions,
          xpGained: completion.xpGained,
          completedAt: completion.completedAt,
          passed: completion.passed,
        },
        user: sanitizeUser(freshUser),
        newAchievements,
        nextAvailableAt: cooldownEnd,
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Return all article IDs the user has completed quizzes for.
 */
exports.getMyCompletions = async (req, res) => {
  try {
    const completions = await QuizCompletion.find({
      user: req.user._id.toString(),
    })
      .sort({ completedAt: -1 })
      .lean();

    const completedArticleIds = [
      ...new Set(completions.map((c) => c.article.toString())),
    ];

    res.status(200).json({
      status: "success",
      data: { completedArticleIds, completions },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

/**
 * Return a random quiz completion from 7+ days ago for weekly revision.
 */
exports.getRevisionQuiz = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldCompletions = await QuizCompletion.find({
      user: req.user._id.toString(),
      completedAt: { $lte: sevenDaysAgo },
    }).lean();

    if (oldCompletions.length === 0) {
      return res.status(200).json({
        status: "success",
        data: { revision: null },
      });
    }

    const random =
      oldCompletions[Math.floor(Math.random() * oldCompletions.length)];

    res.status(200).json({
      status: "success",
      data: {
        revision: {
          articleId: random.article,
          lastScore: random.score,
          totalQuestions: random.totalQuestions,
          completedAt: random.completedAt,
        },
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
