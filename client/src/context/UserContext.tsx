import { useState, type ReactNode } from "react";
import type { User } from "../types/User/user";
import { UserContext } from "./UserContextCreate";

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [authState, setAuthState] = useState<{
    user: User | null;
    token: string | null;
  }>(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      return {
        user: JSON.parse(storedUser) as User,
        token: storedToken,
      };
    }

    return { user: null, token: null };
  });

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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
