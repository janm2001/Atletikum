import axios from "axios";

export const API_BASE_URL = "http://localhost:5001/api/v1";
export const API_ORIGIN = new URL(API_BASE_URL).origin;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    paramsSerializer: { indexes: null },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
