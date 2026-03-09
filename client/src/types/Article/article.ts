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

export interface Article {
  _id: string;
  title: string;
  summary: string;
  content: string;
  tag: ArticleTagType;
  sourceUrl?: string;
  sourceTitle?: string;
  coverImage?: string;
  quiz?: QuizQuestion[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

export type ArticleSummary = Omit<Article, "quiz">;
