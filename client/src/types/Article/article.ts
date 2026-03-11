import type { Exercise } from "@/types/Exercise/exercise";

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

export const ARTICLE_TAG_LABELS: Record<ArticleTagType, string> = {
  [ArticleTag.TRAINING]: "Trening",
  [ArticleTag.NUTRITION]: "Prehrana",
  [ArticleTag.RECOVERY]: "Oporavak",
  [ArticleTag.PHYSIOLOGY]: "Fiziologija",
  [ArticleTag.PSYCHOLOGY]: "Psihologija",
  [ArticleTag.BIOMECHANICS]: "Biomehanika",
  [ArticleTag.PERIODIZATION]: "Periodizacija",
};

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
