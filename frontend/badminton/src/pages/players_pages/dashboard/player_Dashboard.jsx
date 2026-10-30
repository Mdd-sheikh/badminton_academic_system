import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
// Reuses the coach dashboard styles so colours, layout and theme stay identical
import "../../coaches_page/dashboard/DashboardC.css";

const NAV = [
    { items: [{ to: "/player/dashboard", label: "Home", icon: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" }] },
    {
        group: "My game",
        items: [
            { to: "/player/performance", label: "Performance", icon: "M5 20V10M12 20V4M19 20v-7" },
            { to: "/player/training", label: "Training plan", icon: "M4 12h3M17 12h3M7 8v8M17 8v8M7 12h10" },
            { to: "/player/matches", label: "Matches", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18" },
            { to: "/player/achievements", label: "Achievements", icon: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" },
        ],
    },
    {
        group: "Academy",
        items: [
            { to: "/player/schedule", label: "Schedule", icon: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4" },
            { to: "/player/attendance", label: "Attendance", icon: "M5 12l5 5 9-10" },
            { to: "/player/tournaments", label: "Tournaments", icon: "M5 21V4M5 4h11l-2 4 2 4H5" },
            { to: "/player/notifications", label: "Notifications", icon: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4" },
        ],
    },
    {
        items: [{ to: "/player/settings", label: "Settings", icon: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4" }],
    },
    {
        items:[{ to:"/logout", label:"Logout", icon:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"}]
    }
];

const TITLES = Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i.to, i.label])));

function Icon({ d }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={d} />
        </svg>
    );
}

export default function Player_Dashboard({ unread = 2, user = { name: "Aarav Sharma", initials: "AS" } }) {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem("sp-theme") || "dark");
    const { pathname } = useLocation();

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("sp-theme", theme);
    }, [theme]);

    useEffect(() => setOpen(false), [pathname]);

    const title = TITLES[pathname] || TITLES["/" + pathname.split("/").slice(1, 3).join("/")] || "Home";

    return (
        <div className="dash">
            <aside className={`dash-side ${open ? "is-open" : ""}`} aria-label="Player navigation">
                <div className="dash-logo">
                    SMASHPOINT <span>PLAYER</span>
                </div>
                {NAV.map((g, i) => (
                    <div key={i}>
                        {g.group && <div className="dash-group">{g.group}</div>}
                        {g.items.map((it) => (
                            <NavLink key={it.to} to={it.to} className={({ isActive }) => `dash-link ${isActive ? "is-active" : ""}`}>
                                <Icon d={it.icon} />
                                {it.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </aside>

            {open && <button className="dash-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

            <div className="dash-body">
                <header className="dash-top">
                    <button className="dash-icon dash-burger" onClick={() => setOpen(true)} aria-label="Open menu">
                        <Icon d="M3 6h18M3 12h18M3 18h18" />
                    </button>
                    <h1 className="dash-title">{title}</h1>
                    <input className="dash-search" placeholder="Search sessions, matches, drills" aria-label="Search" />
                    <div className="dash-actions">
                        <button className="dash-icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Switch theme">
                            <Icon d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" />
                        </button>
                        <NavLink to="/player/notifications" className="dash-icon" aria-label={`Notifications, ${unread} unread`}>
                            <Icon d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4" />
                            {unread > 0 && <span className="dash-badge">{unread}</span>}
                        </NavLink>
                        <span className="dash-avatar" title={user.name}>{user.initials}</span>
                    </div>
                </header>

                <main className="dash-page">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
