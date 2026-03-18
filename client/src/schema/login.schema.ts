import { z } from "zod";
import i18next from "i18next";
import { passwordSchema } from "./password.schema";

const t = (key: string) => i18next.t(key);

export const loginSchema = z.object({
    username: z.string().min(3, t("validation.usernameMin")),
    password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
