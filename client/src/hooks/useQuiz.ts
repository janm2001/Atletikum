import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addArticleToQuizCompletions,
  syncQuizStatusAfterSubmission,
} from "@/lib/query-cache";
import {
  getMyQuizCompletions,
  getQuizStatus,
  getRevisionQuiz,
  submitQuiz,
} from "@/api/quiz";
import { keys } from "../lib/query-keys";
import type { NewAchievement } from "../types/Achievement/achievement";
import type { QuizStatus, QuizSubmitResult } from "@/types/Article/quiz";

export type { NewAchievement };
export type { QuizStatus, QuizSubmitResult } from "@/types/Article/quiz";

export const useQuizStatus = (articleId: string) => {
  return useQuery<QuizStatus>({
    queryKey: keys.quiz.status(articleId),
    queryFn: () => getQuizStatus(articleId),
    enabled: !!articleId,
    staleTime: 0,
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation<
    QuizSubmitResult,
    Error,
    { articleId: string; submittedAnswers: number[] }
  >({
    mutationFn: submitQuiz,
    onSuccess: (result, variables) => {
      queryClient.setQueryData<QuizStatus | undefined>(
        keys.quiz.status(variables.articleId),
        () => syncQuizStatusAfterSubmission(result.data),
      );

      queryClient.setQueryData<string[] | undefined>(
        keys.quiz.completions(),
        (completedArticleIds) =>
          addArticleToQuizCompletions(
            completedArticleIds,
            variables.articleId,
          ),
      );

      queryClient.invalidateQueries({
        queryKey: keys.quiz.status(variables.articleId),
      });

      queryClient.invalidateQueries({
        queryKey: keys.quiz.completions(),
      });

      queryClient.invalidateQueries({
        queryKey: keys.challenges.weekly(),
      });

      queryClient.invalidateQueries({
        queryKey: keys.gamification.status(),
      });

      queryClient.invalidateQueries({
        queryKey: keys.leaderboard.all,
      });
    },
  });
};

export const useMyQuizCompletions = () => {
  return useQuery<string[]>({
    queryKey: keys.quiz.completions(),
    queryFn: getMyQuizCompletions,
  });
};

export const useRevisionQuiz = () => {
  return useQuery({
    queryKey: keys.quiz.revision(),
    queryFn: getRevisionQuiz,
  });
};
