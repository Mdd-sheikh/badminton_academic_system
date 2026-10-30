
import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import {
    FiMenu,
    FiX,
    FiMoon,
    FiSun,
    FiUser,
    FiChevronDown,
} from "react-icons/fi";

import "./Navbar.css";

export default function Navbar({ link }) {
    // ==========================================
    // STATE MANAGEMENT
    // ==========================================

    // Controls the responsive mobile navigation.
    const [menuOpen, setMenuOpen] = useState(false);

    // Controls the navbar scroll effect.
    const [scrolled, setScrolled] = useState(false);

    // Stores the currently selected navigation link.
    // Only this link will receive the active class.
    const [activeLink, setActiveLink] = useState("/");

    // Load the saved theme safely.
    const [darkMode, setDarkMode] = useState(() => {
        try {
            return localStorage.getItem("smashpoint-theme") === "dark";
        } catch {
            return false;
        }
    });

    // React Router helpers.
    const location = useLocation();
    const navigate = useNavigate();

    // ==========================================
    // NAVIGATION DATA
    // ==========================================

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Trial", path: "#trial" },
        { name: "Features", path: "#features" },
        { name: "Coaches", path: "#coaches" },
    ];

    // ==========================================
    // SYNCHRONIZE ACTIVE LINK WITH THE URL
    // ==========================================

    useEffect(() => {
        if (location.hash) {
            // Example: #coaches selects only Coaches.
            setActiveLink(decodeURIComponent(location.hash));
        } else if (location.pathname === "/") {
            // Home is active when there is no section hash.
            setActiveLink("/");
        } else {
            // Supports other application routes.
            setActiveLink(location.pathname);
        }
    }, [location.pathname, location.hash]);

    // ==========================================
    // SHARED LINK CLASS
    // Desktop and mobile use the same active state.
    // ==========================================




    // ==========================================
    // CLOSE MOBILE MENU
    // ==========================================

    const closeMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    // ==========================================
    // SCROLL TO PAGE SECTION
    // ==========================================

    const scrollToSection = useCallback((sectionId) => {
        const section = document.getElementById(sectionId);

        if (!section) {
            return false;
        }

        section.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        return true;
    }, []);

    // ==========================================
    // HANDLE NAVIGATION AND ACTIVE UNDERLINE
    // ==========================================

    const handleNavigation = (event, path) => {
        // Immediately select only the clicked link.
        setActiveLink(path);

        // Regular routes such as Home continue normally.
        if (!path.startsWith("#")) {
            closeMenu();
            return;
        }

        // Prevent the browser from navigating to a
        // separate route for the section link.
        event.preventDefault();

        const sectionId = path.slice(1);

        closeMenu();

        // If already on the same section, scroll again
        // without requiring another URL change.
        if (
            location.pathname === "/" &&
            location.hash === path
        ) {
            scrollToSection(sectionId);
            return;
        }

        // Navigate to Home and select the requested section.
        navigate({
            pathname: "/",
            hash: path,
        });
    };

    // ==========================================
    // SCROLL AFTER NAVIGATION
    // ==========================================

    useEffect(() => {
        if (location.pathname !== "/" || !location.hash) {
            return;
        }

        const sectionId = decodeURIComponent(
            location.hash.slice(1)
        );

        const animationFrame = window.requestAnimationFrame(() => {
            scrollToSection(sectionId);
        });

        return () => {
            window.cancelAnimationFrame(animationFrame);
        };
    }, [
        location.pathname,
        location.hash,
        scrollToSection,
    ]);

    // ==========================================
    // NAVBAR SCROLL EFFECT
    // ==========================================

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // ==========================================
    // DARK / LIGHT THEME
    // ==========================================

    useEffect(() => {
        document.documentElement.dataset.theme = darkMode
            ? "dark"
            : "light";

        try {
            localStorage.setItem(
                "smashpoint-theme",
                darkMode ? "dark" : "light"
            );
        } catch {
            // Theme still works if storage is unavailable.
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((previous) => !previous);
    };

    // ==========================================
    // KEYBOARD ACCESSIBILITY
    // ==========================================

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        };

        window.addEventListener("keydown", closeOnEscape);

        document.body.classList.toggle("menu-open", menuOpen);

        return () => {
            window.removeEventListener("keydown", closeOnEscape);
            document.body.classList.remove("menu-open");
        };
    }, [menuOpen, closeMenu]);

    // ==========================================
    // COMPONENT UI
    // ==========================================

    return (
        <header
            className={`sp-navbar ${scrolled ? "is-scrolled" : ""
                } ${menuOpen ? "menu-active" : ""}`}
        >
            <nav
                className="sp-nav-container"
                aria-label="Main navigation"
            >
                {/* BRAND LOGO */}

                <Link
                    to="/"
                    className="sp-brand"
                    aria-label="SmashPoint Academy home"
                    onClick={() => {
                        setActiveLink("/");
                        closeMenu();
                    }}
                >
                    <span className="sp-brand-mark" aria-hidden="true">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle
                                cx="20"
                                cy="20"
                                r="17"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                opacity=".35"
                            />

                            <path
                                d="M13 25L23 12L28 17L17 28"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <circle
                                cx="27"
                                cy="11"
                                r="3"
                                fill="#27D982"
                            />

                            <path
                                d="M11 30L17 24"
                                stroke="#27D982"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </span>

                    <span className="sp-brand-text">
                        <span className="sp-brand-name">
                            SmashPoint
                        </span>

                        <span className="sp-brand-subtitle">
                            ACADEMY
                        </span>
                    </span>
                </Link>

                {/* DESKTOP NAVIGATION */}

                <div className="sp-nav-links">
                    {navLinks.map((navItem) => (
                        <NavLink
                            key={navItem.path}
                            to={
                                navItem.path.startsWith("#")
                                    ? `/${navItem.path}`
                                    : navItem.path
                            }
                            end={navItem.path === "/"}
                            className={`sp-nav-link ${activeLink === navItem.path ? "active" : ""
                                }`}
                            onClick={(event) =>
                                handleNavigation(event, navItem.path)
                            }
                        >
                            {navItem.name}
                        </NavLink>
                    ))}
                </div>

                {/* DESKTOP ACTION BUTTONS */}

                <div className="sp-nav-actions">
                    <button
                        className="sp-icon-btn"
                        type="button"
                        onClick={toggleTheme}
                        aria-label={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        title={darkMode ? "Light mode" : "Dark mode"}
                    >
                        {darkMode ? <FiSun /> : <FiMoon />}
                    </button>

                    <Link
                        to="/auth"
                        className="sp-join-btn"
                        onClick={closeMenu}
                    >
                        Join Now
                    </Link>

                    <Link
                        to="/login"
                        className="sp-profile-btn"
                        aria-label="Login to your account"
                        title="Login"
                        onClick={closeMenu}
                    >
                        <FiUser />
                    </Link>

                    <button
                        type="button"
                        className="sp-menu-btn"
                        onClick={() =>
                            setMenuOpen((previous) => !previous)
                        }
                        aria-label={
                            menuOpen ? "Close menu" : "Open menu"
                        }
                        aria-expanded={menuOpen}
                        aria-controls="sp-mobile-menu"
                    >
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </nav>

            {/* MOBILE NAVIGATION */}

            <div
                id="sp-mobile-menu"
                className={`sp-mobile-menu ${menuOpen ? "open" : ""
                    }`}
                aria-hidden={!menuOpen}
                inert={!menuOpen}
            >
                <div className="sp-mobile-inner">
                    {navLinks.map((navItem) => (
                        <NavLink
                            key={navItem.path}
                            to={
                                navItem.path.startsWith("#")
                                    ? `/${navItem.path}`
                                    : navItem.path
                            }
                            end={navItem.path === "/"}
                            className={`sp-mobile-link ${activeLink === navItem.path ? "active" : ""
                                }`}
                            onClick={(event) =>
                                handleNavigation(event, navItem.path)
                            }
                        >
                            {navItem.name}
                        </NavLink>
                    ))}

                    <div className="sp-mobile-divider" />

                    {/* MOBILE LOGIN */}

                    <Link
                        to="/login"
                        className="sp-mobile-link sp-mobile-account"
                        onClick={closeMenu}
                    >
                        <FiUser />
                        Login to your account
                    </Link>

                    {/* MOBILE REGISTRATION */}

                    <Link
                        to="/register"
                        className="sp-mobile-join"
                        onClick={closeMenu}
                    >
                        Join SmashPoint Academy
                        <FiChevronDown className="sp-join-arrow" />
                    </Link>

                    {/* MOBILE THEME TOGGLE */}

                    <button
                        type="button"
                        className="sp-mobile-theme"
                        onClick={toggleTheme}
                    >
                        {darkMode ? <FiSun /> : <FiMoon />}

                        {darkMode
                            ? "Switch to light mode"
                            : "Switch to dark mode"}
                    </button>
                </div>
            </div>
        </header>
    );
}
