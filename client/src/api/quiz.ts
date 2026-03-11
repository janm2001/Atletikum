import type {
    MyCompletionsResult,
    QuizStatus,
    QuizSubmitResult,
    RevisionResult,
} from "@/types/Article/quiz";
import { apiClient } from "@/utils/apiService";

export async function getQuizStatus(articleId: string): Promise<QuizStatus> {
    const { data } = await apiClient.get<QuizStatus>(`/quiz/${articleId}/status`);
    return data;
}

export async function submitQuiz({
    articleId,
    submittedAnswers,
}: {
    articleId: string;
    submittedAnswers: number[];
}): Promise<QuizSubmitResult> {
    const { data } = await apiClient.post<QuizSubmitResult>(
        `/quiz/${articleId}/submit`,
        {
            submittedAnswers,
        },
    );
    return data;
}

export async function getMyQuizCompletions(): Promise<string[]> {
    const { data } = await apiClient.get<MyCompletionsResult>(
        "/quiz/my-completions",
    );
    return data.data.completedArticleIds;
}

export async function getRevisionQuiz(): Promise<
    RevisionResult["data"]["revision"]
> {
    const { data } = await apiClient.get<RevisionResult>("/quiz/revision");
    return data.data.revision;
}