import { useMutation } from "@tanstack/react-query";
import { login, register, requestPasswordReset, resetPassword } from "@/api/auth";
import type {
    AuthResponse,
    PasswordResetRequestResponse,
    RegisterPayload,
    ResetPasswordPayload,
    StatusResponse,
} from "@/types/User/auth";
import type { ForgotPasswordInput } from "@/schema/forgotPassword.schema";
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

export function useRequestPasswordReset() {
    return useMutation<PasswordResetRequestResponse, Error, ForgotPasswordInput>({
        mutationFn: requestPasswordReset,
    });
}

export function useResetPassword() {
    return useMutation<StatusResponse, Error, { token: string; payload: ResetPasswordPayload }>({
        mutationFn: resetPassword,
    });
}
