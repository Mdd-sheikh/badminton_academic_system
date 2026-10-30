import { Navigate, Outlet, useLocation } from "react-router-dom";

// Adjust these two lines to match how you store login data
const getToken = () => localStorage.getItem("token");
const getRole = () => localStorage.getItem("role"); // e.g. "coach", "player", "admin"

export default function PrivateRoute({ children, allowedRoles, redirectTo = "/auth" }) {
  const location = useLocation();
  const token = getToken();

  // 1. Not logged in: go to login and remember where they were headed
  if (!token) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 2. Logged in but wrong role: send to home
  if (allowedRoles && !allowedRoles.includes(getRole())) {
    return <Navigate to="/" replace />;
  }

  // 3. Allowed: render the page (works with children or nested routes)
  return children ? children : <Outlet />;
}