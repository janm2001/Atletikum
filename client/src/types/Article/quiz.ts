import type { NewAchievement } from "@/types/Achievement/achievement";
import type { User } from "@/types/User/user";

export interface QuizCompletion {
    score: number;
    totalQuestions: number;
    xpGained: number;
    completedAt: string;
    passed?: boolean;
}

export interface QuizStatusPayload {
    canTakeQuiz: boolean;
    lastCompletion: QuizCompletion | null;
    nextAvailableAt: string | null;
}

export interface QuizSubmitPayload {
    completion: QuizCompletion & {
        passed: boolean;
    };
    user: User | null;
    newAchievements: NewAchievement[];
    nextAvailableAt: string;
}

export interface MyCompletionsPayload {
    completedArticleIds: string[];
}

export interface RevisionQuiz {
    articleId: string;
    lastScore: number;
    totalQuestions: number;
    completedAt: string;
}

export interface RevisionPayload {
    revision: RevisionQuiz | null;
}

export type QuizStatus = QuizStatusPayload;

export interface QuizSubmitResult {
    status: string;
    data: QuizSubmitPayload;
}

export type MyCompletionsResult = {
    status: string;
    data: MyCompletionsPayload;
};

export type RevisionResult = {
    status: string;
    data: RevisionPayload;
};

export interface ArticleQuizResult {
    xpGained: number;
    score: number;
    totalQuestions: number;
    level?: number;
    totalXp?: number;
    passed?: boolean;
    completedAt?: string;
    nextAvailableAt?: string | null;
}
