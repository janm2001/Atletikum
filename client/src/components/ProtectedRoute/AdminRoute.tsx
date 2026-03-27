import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import SpinnerComponent from "../SpinnerComponent/SpinnerComponent";

export const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useUser();

  if (loading) {
    return <SpinnerComponent />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/pregled" replace />;
  }

  return <Outlet />;
};
