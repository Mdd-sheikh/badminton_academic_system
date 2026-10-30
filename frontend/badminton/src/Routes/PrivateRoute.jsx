import { Navigate, Outlet, useLocation } from "react-router-dom";

const DASHBOARDS = {
    player: "/player/dashboard",
    parent: "/player/dashboard",
    coach: "/coach/dashboard",
};

const getToken = () => localStorage.getItem("token");

const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
};

export default function PrivateRoute({
    children,
    allowedRoles,
    redirectTo = "/login",
}) {
    const location = useLocation();
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={DASHBOARDS[user.role] || "/login"} replace />;
    }

    return children ? children : <Outlet />;
}