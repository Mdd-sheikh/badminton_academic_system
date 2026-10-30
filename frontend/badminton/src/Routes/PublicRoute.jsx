/**
 * PublicRouter.jsx  (suggested location: src/routes/PublicRouter.jsx)
 *
 * WHAT THIS FILE DOES
 * -------------------
 * 1. Provides the shared "public site" layout: the .landing-page wrapper
 *    div with the Navbar on top and the Footer at the bottom.
 * 2. Acts as a guard for guest-only pages (landing, login, signup, ...).
 *    If a user is already logged in, they are redirected to their own
 *    dashboard instead of seeing these pages.
 *
 * HOW TO USE (see App.jsx)
 * ------------------------
 *   <Route element={<PublicRouter />}>        // guests only + layout
 *     <Route path="/" element={<Home />} />
 *     <Route path="/login" element={<Auth />} />
 *   </Route>
 *
 *   <Route element={<PublicLayout />}>        // layout only, no guard
 *     <Route path="/parent/link-child" element={<Auth />} />
 *   </Route>
 *
 * "Logged in" means a token AND a valid user are stored in localStorage.
 * Both are written by the login handler in auth/Authentication/Auth.jsx.
 */

import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

// Dashboard path for each role. Keep in sync with DASHBOARDS in Auth.jsx.
const DASHBOARDS = {
    player: "/player/dashboard",
    parent: "/parent/dashboard",
    coach: "/coach/dashboard",
};

/**
 * Reads the saved session from localStorage.
 * Returns the user object if the session looks valid, otherwise null.
 * The try/catch protects against corrupted JSON in localStorage.
 */
function getLoggedInUser() {
    try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");
        return token && user && DASHBOARDS[user.role] ? user : null;
    } catch {
        return null;
    }
}

/**
 * Decides where a logged-in user should land.
 * These are the same rules the login handler in Auth.jsx uses.
 */
function getHomePath(user) {
    // Coach waiting for admin approval
    if (user.role === "coach" && user.approvalStatus === "pending") {
        return "/coach/pending-approval";
    }
    // Player who has not completed enrollment yet
    if (user.role === "player" && !user.enrollmentCompleted) {
        return "/register";
    }
    // Parent who has not linked a child yet
    if (user.role === "parent" && !user.hasLinkedChild) {
        return "/parent/link-child";
    }
    return DASHBOARDS[user.role];
}

/**
 * Layout only (no guard).
 * <Outlet /> is where the matched child route (Home, Auth, ...) renders.
 * The "landing-page" class is styled in App.css.
 */
export function PublicLayout() {
    return (
        <div className="landing-page">
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    );
}

/**
 * Layout + guard (default export).
 * Guests see the page inside the public layout.
 * Logged-in users are redirected to their dashboard.
 * `replace` stops the redirect from adding a back-button entry.
 */
export default function PublicRouter() {
    const user = getLoggedInUser();

    if (user) {
        return <Navigate to={getHomePath(user)} replace />;
    }

    return <PublicLayout />;
}