import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authcontext";

export default function RequireGuest() {
  const { token } = useAuth();

  // If logged in, bounce them away from logged out routes
  if (token) return <Navigate to="/dashboard" replace />;

  // Otherwise, allow them to see logged out routes
  return <Outlet />;
}