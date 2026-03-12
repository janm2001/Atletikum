import { z } from "zod";
import i18next from "i18next";
import { passwordSchema } from "./password.schema";

const t = (key: string) => i18next.t(key);

export const registerSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(t("validation.emailInvalid")),
    password: passwordSchema,
    passwordConfirm: passwordSchema,
    trainingFrequency: z.number().min(0).max(7),
    focus: z.enum(["mobilnost", "snaga", "prevencija_ozlijede"])
}).refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: t("validation.passwordMismatch"),
});

export type RegisterInput = z.infer<typeof registerSchema>;