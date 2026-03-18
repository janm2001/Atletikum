import { z } from 'zod';
import i18next from 'i18next';

const t = (key: string) => i18next.t(key);

export const passwordSchema = z
    .string()
    .min(8, { message: t("validation.passwordMin") })
    .max(32, { message: t("validation.passwordMax") })
    .regex(/[a-z]/, { message: t("validation.passwordLowercase") })
    .regex(/[A-Z]/, { message: t("validation.passwordUppercase") })
    .regex(/[0-9]/, { message: t("validation.passwordNumber") })
    .regex(/[^a-zA-Z0-9]/, { message: t("validation.passwordSpecial") });
