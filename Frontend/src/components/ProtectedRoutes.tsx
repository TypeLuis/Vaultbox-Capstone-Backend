import { useAuth } from "../context/authcontext";
import { Navigate, Outlet } from "react-router-dom"; //used to protect certain routes

export default function ProtectedRoutes() {
    const { token } = useAuth()

    // If logged out, bounce them away from logged in routes
    if (!token) return <Navigate to="/auth" replace />;

    // Otherwise, allow them to see logged out routes
    return <Outlet />;
}