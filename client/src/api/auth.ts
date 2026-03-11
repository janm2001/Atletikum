import type { ForgotPasswordInput } from "@/schema/forgotPassword.schema";
import type { LoginInput } from "@/schema/login.schema";
import type {
    AuthResponse,
    PasswordResetRequestResponse,
    RegisterPayload,
    ResetPasswordPayload,
    StatusResponse,
} from "@/types/User/auth";
import { apiClient } from "@/utils/apiService";

export async function login(payload: LoginInput): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
}

export async function register(
    payload: RegisterPayload,
): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
    return data;
}

export async function requestPasswordReset(
    payload: ForgotPasswordInput,
): Promise<PasswordResetRequestResponse> {
    const { data } = await apiClient.post<PasswordResetRequestResponse>(
        "/auth/request-reset",
        payload,
    );
    return data;
}

export async function resetPassword({
    token,
    payload,
}: {
    token: string;
    payload: ResetPasswordPayload;
}): Promise<StatusResponse> {
    const { data } = await apiClient.post<StatusResponse>(
        `/auth/reset-password/${token}`,
        payload,
    );
    return data;
}