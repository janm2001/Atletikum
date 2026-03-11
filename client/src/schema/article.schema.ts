import { z } from "zod";
import { ArticleTag } from "../types/Article/article";

const quizQuestionSchema = z
  .object({
    _id: z.string().optional(),
    question: z.string().min(3, "Pitanje mora imati barem 3 znaka"),
    options: z
      .array(z.string().min(1, "Opcija ne može biti prazna"))
      .min(2, "Potrebne su barem dvije opcije"),
    correctIndex: z.number().min(0, "Točan odgovor mora biti odabran"),
  })
  .refine((q) => q.correctIndex < q.options.length, {
    message: "Točan odgovor mora biti unutar raspona opcija",
    path: ["correctIndex"],
  });

export const articleSchema = z.object({
  title: z.string().min(3, "Naslov mora imati barem 3 znaka"),
  summary: z.string().optional(),
  content: z.string().min(10, "Sadržaj mora imati barem 10 znakova"),
  actionSummary: z.array(z.string().min(2, "Akcijska stavka je prekratka")).optional(),
  tag: z.nativeEnum(ArticleTag),
  sourceUrl: z
    .string()
    .url("Neispravan URL izvora")
    .optional()
    .or(z.literal("")),
  sourceTitle: z.string().optional(),
  coverImage: z
    .string()
    .url("Neispravan URL slike")
    .optional()
    .or(z.literal(""))
    .or(z.undefined()),
  author: z.string().optional(),
  relatedArticleIds: z.array(z.string()).optional(),
  relatedExerciseIds: z.array(z.string()).optional(),
  quiz: z.array(quizQuestionSchema).optional(),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
