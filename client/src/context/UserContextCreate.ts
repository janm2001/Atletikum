import { createContext } from "react";
import type { UserContextType } from "../types/User/userContextType";

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);
