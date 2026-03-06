const { QuizCompletion } = require("../models/QuizCompletion");
const { User } = require("../models/User");
const { getLevelFromTotalXp } = require("../utils/leveling");

const QUIZ_COOLDOWN_DAYS = 3;
const XP_PER_CORRECT_ANSWER = 25;

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
    const { score, totalQuestions } = req.body;
    const userId = req.user._id.toString();

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

    // --- Calculate XP ---
    const xpGained = Math.max(0, score) * XP_PER_CORRECT_ANSWER;

    // --- Save completion ---
    const completion = await QuizCompletion.create({
      user: userId,
      article: articleId,
      score,
      totalQuestions,
      xpGained,
    });

    // --- Update user XP ---
    const updatedUser = await User.findById(req.user._id);
    if (updatedUser) {
      updatedUser.totalXp += xpGained;
      updatedUser.level = getLevelFromTotalXp(updatedUser.totalXp);
      await updatedUser.save();
    }

    const safeUser = updatedUser
      ? {
          _id: updatedUser._id,
          username: updatedUser.username,
          trainingFrequency: updatedUser.trainingFrequency,
          focus: updatedUser.focus,
          level: updatedUser.level,
          totalXp: updatedUser.totalXp,
          dailyStreak: updatedUser.dailyStreak,
          role: updatedUser.role,
          profilePicture: updatedUser.profilePicture,
        }
      : null;

    const cooldownEnd = new Date();
    cooldownEnd.setDate(cooldownEnd.getDate() + QUIZ_COOLDOWN_DAYS);

    res.status(201).json({
      status: "success",
      data: {
        completion: {
          score: completion.score,
          totalQuestions: completion.totalQuestions,
          xpGained: completion.xpGained,
          completedAt: completion.completedAt,
        },
        user: safeUser,
        nextAvailableAt: cooldownEnd,
      },
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
