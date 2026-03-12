import { z } from "zod";
import i18next from "i18next";
import { passwordSchema } from "./password.schema";

const t = (key: string) => i18next.t(key);

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        passwordConfirm: passwordSchema,
    })
    .refine((data) => data.password === data.passwordConfirm, {
        path: ["passwordConfirm"],
        message: t("validation.passwordMismatch"),
    });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;