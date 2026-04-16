import { z } from "zod";
import i18next from "i18next";

const t = (key: string) => i18next.t(key);

export const challengeTemplateSchema = z.object({
  type: z.enum(["quiz", "workout", "reading", "custom"] as const, {
    error: t("validation.challengeTemplate.typeRequired"),
  }),
  targetCount: z.number().min(1, t("validation.challengeTemplate.targetCountMin")),
  xpReward: z.number().min(0, t("validation.challengeTemplate.xpRewardMin")),
  description: z.string(),
  enabled: z.boolean(),
});

export type TemplateFormValues = z.infer<typeof challengeTemplateSchema>;
