import { z } from "zod";

export const forgotPasswordSchema = z.object({
    username: z.string().min(3, "Korisničko ime mora imati barem 3 znaka"),
    email: z.string().email("Unesite valjanu email adresu"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;