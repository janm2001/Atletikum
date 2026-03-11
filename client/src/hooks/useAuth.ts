import { useMutation } from "@tanstack/react-query";
import { login, register } from "@/api/auth";
import type { AuthResponse, RegisterPayload } from "@/types/User/auth";
import type { LoginInput } from "../schema/login.schema";

export function useLogin() {
    return useMutation<AuthResponse, Error, LoginInput>({
        mutationFn: login,
    });
}

export function useRegister() {
    return useMutation<AuthResponse, Error, RegisterPayload>({
        mutationFn: register,
    });
}
