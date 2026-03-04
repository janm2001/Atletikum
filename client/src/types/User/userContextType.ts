import type { User } from "./user";

export type UserContextType = {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    updateUser: (userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}