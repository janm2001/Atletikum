import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/User/user";
import { UserContext } from "./UserContextCreate";

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<{
    user: User | null;
    token: string | null;
  }>(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        return {
          user: JSON.parse(storedUser) as User,
          token: storedToken,
        };
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    return { user: null, token: null };
  });

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setLoading(false);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const login = (userData: User, newToken: string) => {
    setAuthState({ user: userData, token: newToken });
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        login,
        logout,
        isAuthenticated: !!authState.token,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
