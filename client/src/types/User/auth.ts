import type { RegisterInput } from "@/schema/register.schema";
import type { User } from "@/types/User/user";

export type AuthPayload = {
    user: User;
};

export type AuthResponse = {
    status: string;
    token: string;
    data: AuthPayload;
    message?: string;
};

export type RegisterPayload = Omit<RegisterInput, "passwordConfirm">;