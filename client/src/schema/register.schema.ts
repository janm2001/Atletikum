import { z } from "zod";
import { passwordSchema } from "./password.schema";

export const registerSchema = z.object({
    username: z.string().min(3),
    password: passwordSchema,
    passwordConfirm: passwordSchema,
    trainingFrequency: z.number().min(0).max(7),
    focus: z.enum(["mobilnost", "snaga", "prevencija_ozlijede"])
}).refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Lozinke se ne poklapaju.",
});

export type RegisterInput = z.infer<typeof registerSchema>;