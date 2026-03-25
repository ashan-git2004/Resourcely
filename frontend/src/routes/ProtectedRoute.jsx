import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, auth } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0) {
    const roles = auth?.roles || [];
    const hasAccess = allowedRoles.some((role) => roles.includes(role));

    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
