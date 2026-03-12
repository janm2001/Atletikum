import { z } from "zod";
import i18next from "i18next";

const t = (key: string) => i18next.t(key);

export const forgotPasswordSchema = z.object({
    username: z.string().min(3, t("validation.usernameMin")),
    email: z.string().email(t("validation.emailInvalid")),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;