import type { LoginInput } from "@/schema/login.schema";
import type { AuthResponse, RegisterPayload } from "@/types/User/auth";
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