import i18next from "i18next";
import type { Exercise } from "@/types/Exercise/exercise";

export const ArticleDifficulty = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type ArticleDifficultyType =
  (typeof ArticleDifficulty)[keyof typeof ArticleDifficulty];

export const getArticleDifficultyLabel = (
  difficulty: ArticleDifficultyType
): string => i18next.t(`enums.articleDifficulty.${difficulty}`);

export const ArticleTag = {
  TRAINING: "TRAINING",
  NUTRITION: "NUTRITION",
  RECOVERY: "RECOVERY",
  PHYSIOLOGY: "PHYSIOLOGY",
  PSYCHOLOGY: "PSYCHOLOGY",
  BIOMECHANICS: "BIOMECHANICS",
  PERIODIZATION: "PERIODIZATION",
} as const;

export type ArticleTagType = (typeof ArticleTag)[keyof typeof ArticleTag];

export const getArticleTagLabel = (tag: ArticleTagType): string =>
  i18next.t(`enums.articleTags.${tag}`);

export interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ArticleBookmarkState {
  isBookmarked: boolean;
  progressPercent: number;
  isCompleted: boolean;
  savedAt?: string | null;
  lastViewedAt?: string | null;
}

export interface Article {
  _id: string;
  title: string;
  summary: string;
  content: string;
  actionSummary?: string[];
  tag: ArticleTagType;
  difficulty?: ArticleDifficultyType;
  sequenceGroup?: string;
  sequenceOrder?: number;
  sourceUrl?: string;
  sourceTitle?: string;
  coverImage?: string;
  relatedArticleIds?: string[];
  relatedExerciseIds?: string[];
  relatedArticles?: ArticleSummary[];
  relatedExercises?: Exercise[];
  bookmark?: ArticleBookmarkState;
  quiz?: QuizQuestion[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

export type ArticleSummary = Omit<Article, "quiz">;
