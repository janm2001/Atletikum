import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface ApiResponse<T = unknown> {
    status: string;
    data?: T;
    token?: string;
    message?: string;
}

export const apiService = {
    get: async <T = unknown>(
        endpoint: string,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.get<ApiResponse<T>>(endpoint, config);
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },
    post: async <T = unknown>(
        endpoint: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.post<ApiResponse<T>>(
                endpoint,
                data,
                config
            );
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },
    put: async <T = unknown>(
        endpoint: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.put<ApiResponse<T>>(
                endpoint,
                data,
                config
            );
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },
    patch: async <T = unknown>(
        endpoint: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.patch<ApiResponse<T>>(
                endpoint,
                data,
                config
            );
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },
    delete: async <T = unknown>(
        endpoint: string,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
        try {
            const response = await apiClient.delete<ApiResponse<T>>(
                endpoint,
                config
            );
            return response.data;
        } catch (error) {
            throw handleError(error);
        }
    },
};
const handleError = (error: unknown): Error => {
    if (axios.isAxiosError(error)) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "An error occurred";
        return new Error(message);
    }
    return new Error("An unexpected error occurred");
};
