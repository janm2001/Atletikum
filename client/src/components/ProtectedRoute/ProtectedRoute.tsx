import { Navigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return <SpinnerComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
