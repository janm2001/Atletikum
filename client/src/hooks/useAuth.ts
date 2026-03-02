import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../utils/apiService";
import type { User } from "../types/User/user";
import type { LoginInput } from "../schema/login.schema";
import type { RegisterInput } from "../schema/register.schema";

type AuthResponse = {
    status: string;
    token: string;
    data: {
        user: User;
    };
    message?: string;
};

type RegisterPayload = Omit<RegisterInput, "passwordConfirm">;

export function useLogin() {
    return useMutation<AuthResponse, Error, LoginInput>({
        mutationFn: async (payload) => {
            const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
            return data;
        },
    });
}

export function useRegister() {
    return useMutation<AuthResponse, Error, RegisterPayload>({
        mutationFn: async (payload) => {
            const { data } = await apiClient.post<AuthResponse>(
                "/auth/register",
                payload
            );
            return data;
        },
    });
}
