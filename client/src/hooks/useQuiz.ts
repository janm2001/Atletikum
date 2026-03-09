import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../utils/apiService";
import type { User } from "../types/User/user";

export interface NewAchievement {
    _id: string;
    key: string;
    title: string;
    description: string;
    xpReward: number;
    category: string;
    badgeIcon: string;
}

interface QuizStatus {
    canTakeQuiz: boolean;
    lastCompletion: {
        score: number;
        totalQuestions: number;
        xpGained: number;
        completedAt: string;
    } | null;
    nextAvailableAt: string | null;
}

interface QuizSubmitResult {
    status: string;
    data: {
        completion: {
            score: number;
            totalQuestions: number;
            xpGained: number;
            completedAt: string;
        };
        user: User | null;
        newAchievements: NewAchievement[];
        nextAvailableAt: string;
    };
}

interface MyCompletionsResult {
    status: string;
    data: {
        completedArticleIds: string[];
    };
}

interface RevisionResult {
    status: string;
    data: {
        revision: {
            articleId: string;
            lastScore: number;
            totalQuestions: number;
            completedAt: string;
        } | null;
    };
}

export const useQuizStatus = (articleId: string) => {
    return useQuery<QuizStatus>({
        queryKey: ["quiz-status", articleId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/quiz/${articleId}/status`);
            return data;
        },
        enabled: !!articleId,
    });
};

export const useSubmitQuiz = () => {
    const queryClient = useQueryClient();

    return useMutation<
        QuizSubmitResult,
        Error,
        { articleId: string; score: number; totalQuestions: number }
    >({
        mutationFn: async ({ articleId, score, totalQuestions }) => {
            const { data } = await apiClient.post(`/quiz/${articleId}/submit`, {
                score,
                totalQuestions,
            });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["quiz-status", variables.articleId],
            });
            queryClient.invalidateQueries({
                queryKey: ["quiz-completions"],
            });
        },
    });
};

export const useMyQuizCompletions = () => {
    return useQuery<string[]>({
        queryKey: ["quiz-completions"],
        queryFn: async () => {
            const { data } = await apiClient.get<MyCompletionsResult>("/quiz/my-completions");
            return data.data.completedArticleIds;
        },
    });
};

export const useRevisionQuiz = () => {
    return useQuery({
        queryKey: ["quiz-revision"],
        queryFn: async () => {
            const { data } = await apiClient.get<RevisionResult>("/quiz/revision");
            return data.data.revision;
        },
    });
};
