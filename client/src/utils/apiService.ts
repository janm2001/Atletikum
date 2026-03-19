import axios from "axios";
import { STORAGE_KEYS } from "../constants/storageKeys";

const DEFAULT_API_BASE_URL = "http://localhost:5001/api/v1";
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredApiBaseUrl || DEFAULT_API_BASE_URL).replace(
  /\/$/,
  "",
);
export const API_ORIGIN = new URL(API_BASE_URL).origin;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    paramsSerializer: { indexes: null },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            if (token) {
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    },
);
