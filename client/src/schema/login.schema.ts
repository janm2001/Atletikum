import { z } from "zod";
import { passwordSchema } from "./password.schema";

export const loginSchema = z.object({
    username: z.string().min(3),
    password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;