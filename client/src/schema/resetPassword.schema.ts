import { z } from "zod";
import { passwordSchema } from "./password.schema";

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        passwordConfirm: passwordSchema,
    })
    .refine((data) => data.password === data.passwordConfirm, {
        path: ["passwordConfirm"],
        message: "Lozinke se ne poklapaju.",
    });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;