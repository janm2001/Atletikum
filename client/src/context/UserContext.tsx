import { useState, useEffect, type ReactNode } from "react";
import type { User } from "../types/User/user";
import { UserContext } from "./UserContextCreate";
import { queryClient } from "../lib/queryClient";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getMe } from "../api/users";

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [loading] = useState(false);
  const [authState, setAuthState] = useState<{
    user: User | null;
    token: string | null;
  }>(() => {
    const legacyToken = localStorage.getItem("token");
    const legacyUser = localStorage.getItem("user");
    if (legacyToken) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, legacyToken);
      localStorage.removeItem("token");
    }
    if (legacyUser) {
      localStorage.setItem(STORAGE_KEYS.USER, legacyUser);
      localStorage.removeItem("user");
    }

    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedToken && storedUser) {
      try {
        return {
          user: JSON.parse(storedUser) as User,
          token: storedToken,
        };
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    }

    return { user: null, token: null };
  });

  const login = (userData: User, newToken: string) => {
    setAuthState({ user: userData, token: newToken });
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  };

  const updateUser = (userData: User) => {
    setAuthState((prev) => ({ ...prev, user: userData }));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    queryClient.clear();
  };

  useEffect(() => {
    if (!authState.token) return;
    getMe()
      .then((freshUser) => {
        setAuthState((prev) => ({ ...prev, user: freshUser }));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
      })
      .catch(() => {
        // Silently ignore – stale localStorage data is better than crashing
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        login,
        updateUser,
        logout,
        isAuthenticated: !!authState.token,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
