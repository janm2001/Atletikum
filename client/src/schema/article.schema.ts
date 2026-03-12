import { z } from "zod";
import i18next from "i18next";
import { ArticleTag } from "../types/Article/article";

const t = (key: string) => i18next.t(key);

const quizQuestionSchema = z
  .object({
    _id: z.string().optional(),
    question: z.string().min(3, t("validation.article.questionMin")),
    options: z
      .array(z.string().min(1, t("validation.article.optionEmpty")))
      .min(2, t("validation.article.optionsMin")),
    correctIndex: z.number().min(0, t("validation.article.correctRequired")),
  })
  .refine((q) => q.correctIndex < q.options.length, {
    message: t("validation.article.correctRange"),
    path: ["correctIndex"],
  });

export const articleSchema = z.object({
  title: z.string().min(3, t("validation.article.titleMin")),
  summary: z.string().optional(),
  content: z.string().min(10, t("validation.article.contentMin")),
  actionSummary: z.array(z.string().min(2, t("validation.article.actionTooShort"))).optional(),
  tag: z.nativeEnum(ArticleTag),
  sourceUrl: z
    .string()
    .url(t("validation.article.sourceUrlInvalid"))
    .optional()
    .or(z.literal("")),
  sourceTitle: z.string().optional(),
  coverImage: z
    .string()
    .url(t("validation.article.coverImageInvalid"))
    .optional()
    .or(z.literal(""))
    .or(z.undefined()),
  author: z.string().optional(),
  relatedArticleIds: z.array(z.string()).optional(),
  relatedExerciseIds: z.array(z.string()).optional(),
  quiz: z.array(quizQuestionSchema).optional(),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
