import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RequireRole = ({ allowedRoles }: { allowedRoles: Array<"student" | "admin" | "teacher"> }) => {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/courses" replace />;
  }

  return <Outlet />;
};

export default RequireRole;