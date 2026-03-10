import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContextCreate";
import { useSubmitQuiz } from "@/hooks/useQuiz";
import type { QuizQuestion } from "@/types/Article/article";

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
  const userCtx = useContext(UserContext);
  const submitQuizMutation = useSubmitQuiz();

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
    const localScore = questions.reduce((sum, question, index) => {
      return sum + (answers[index] === question.correctIndex ? 1 : 0);
    }, 0);

    try {
      const result = await submitQuizMutation.mutateAsync({
        articleId,
        submittedAnswers: answers,
      });

      const xp = result.data.completion.xpGained;
      const passed = result.data.completion.passed;

      if (result.data.user && userCtx) {
        userCtx.updateUser(result.data.user);
      }

      if (!passed) {
        navigate(`/edukacija/${articleId}`, {
          replace: true,
          state: {
            quizResult: {
              xpGained: 0,
              score: result.data.completion.score,
              totalQuestions: questions.length,
              passed: false,
            },
          },
        });
        return;
      }

      navigate("/slavlje", {
        replace: true,
        state: {
          type: "quiz",
          xpGained: xp,
          score: result.data.completion.score,
          totalQuestions: questions.length,
          title: articleTitle,
          newAchievements: result.data.newAchievements ?? [],
          level: result.data.user?.level,
          totalXp: result.data.user?.totalXp,
          brainXp: result.data.user?.brainXp,
          bodyXp: result.data.user?.bodyXp,
        },
      });
    } catch {
      navigate("/slavlje", {
        replace: true,
        state: {
          type: "quiz",
          xpGained: 0,
          score: localScore,
          totalQuestions: questions.length,
          title: articleTitle,
          newAchievements: [],
        },
      });
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
    isAnswered,
    isSubmitting: submitQuizMutation.isPending,
    selectedOption,
    wasCorrect,
    handleAnswerSubmit,
    handleNextQuestion,
    setSelectedOption,
  };
};