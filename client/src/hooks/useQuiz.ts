import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../utils/apiService";

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
        user: {
            _id: string;
            username: string;
            trainingFrequency: number;
            focus: string;
            level: number;
            totalXp: number;
            dailyStreak: number;
            role: string;
            profilePicture: string;
        } | null;
        nextAvailableAt: string;
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
        },
    });
};
