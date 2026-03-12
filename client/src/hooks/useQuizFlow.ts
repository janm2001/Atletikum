import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserContext } from "@/context/UserContextCreate";
import useActionFeedback from "@/hooks/useActionFeedback";
import { useSubmitQuiz } from "@/hooks/useQuiz";
import type { QuizQuestion } from "@/types/Article/article";
import type { ArticleQuizResult } from "@/types/Article/quiz";
import type { CelebrationState } from "@/types/Celebration/celebration";
import {
  clearPersistedArticleQuizResult,
  persistArticleQuizResult,
  persistCelebrationState,
} from "@/utils/flowSessionStorage";

interface UseQuizFlowParams {
  articleId: string;
  articleTitle: string;
  questions: QuizQuestion[];
}

export const useQuizFlow = ({
  articleId,
  articleTitle,
  questions,
}: UseQuizFlowParams) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userCtx = useContext(UserContext);
  const submitQuizMutation = useSubmitQuiz();
  const { actionError, clearActionError, handleActionError } =
    useActionFeedback();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<number[]>([]);

  const currentQuestion = questions[currentQuestionIdx];
  const correctOption = currentQuestion.options[currentQuestion.correctIndex];
  const wasCorrect = selectedOption === correctOption;

  const handleAnswerSubmit = () => {
    if (selectedOption === null) {
      return;
    }

    const selectedIndex = currentQuestion.options.findIndex(
      (option) => option === selectedOption,
    );

    if (selectedIndex === -1) {
      return;
    }

    setSubmittedAnswers((previous) => {
      const next = [...previous];
      next[currentQuestionIdx] = selectedIndex;
      return next;
    });

    setIsAnswered(true);
  };

  const handleQuizComplete = async (answers: number[]) => {
    clearActionError();

    try {
      const result = await submitQuizMutation.mutateAsync({
        articleId,
        submittedAnswers: answers,
      });

      const { completion, nextAvailableAt, user } = result.data;
      const passed = completion.passed;
      const totalQuestions = completion.totalQuestions;

      if (user && userCtx) {
        userCtx.updateUser(user);
      }

      if (!passed) {
        const failedQuizResult: ArticleQuizResult = {
          xpGained: completion.xpGained,
          score: completion.score,
          totalQuestions,
          passed,
          completedAt: completion.completedAt,
          nextAvailableAt,
        };

        persistArticleQuizResult(articleId, failedQuizResult);
        navigate(`/edukacija/${articleId}`, { replace: true });
        return;
      }

      clearPersistedArticleQuizResult(articleId);
      const celebrationState: CelebrationState = {
        type: "quiz",
        xpGained: completion.xpGained,
        score: completion.score,
        totalQuestions,
        title: articleTitle,
        newAchievements: result.data.newAchievements ?? [],
        level: user?.level,
        totalXp: user?.totalXp,
        brainXp: user?.brainXp,
        bodyXp: user?.bodyXp,
      };
      persistCelebrationState(celebrationState);

      navigate("/slavlje", {
        replace: true,
        state: celebrationState,
      });
    } catch (error) {
      handleActionError(error, t("articles.quiz.submitError"));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      return;
    }

    void handleQuizComplete(submittedAnswers);
  };

  return {
    currentQuestion,
    currentQuestionIdx,
    correctOption,
    actionError,
    clearActionError,
    isAnswered,
    isSubmitting: submitQuizMutation.isPending,
    selectedOption,
    wasCorrect,
    handleAnswerSubmit,
    handleNextQuestion,
    setSelectedOption,
  };
};
