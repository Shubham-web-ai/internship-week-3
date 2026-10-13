import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { user } = useAuth();

  return user && localStorage.getItem("token")
    ? <Outlet />
    : <Navigate to="/login" replace />;
}