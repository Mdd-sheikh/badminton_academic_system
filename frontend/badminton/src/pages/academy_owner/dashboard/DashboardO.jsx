import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import '../../coaches_page/dashboard/DashboardC.css' // same layout, colours and theme as the other dashboards
import "./owner.css";
import { ensureSeed } from "../db/seed.js";

const NAV = [
    { items: [{ to: "/owner/dashboard", label: "Overview", icon: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" }] },
    {
        group: "People", items: [
            { to: "/owner/players", label: "Players", icon: "M9 8m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M3 20c0-4 3-6 6-6s6 2 6 6M16 5a3 3 0 0 1 0 6" },
            { to: "/owner/coaches", label: "Coaches", icon: "M12 3l9 5-9 5-9-5zM7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5" },
            { to: "/owner/teams", label: "Teams", icon: "M4 19v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M17 11a3 3 0 1 0 0-6M20 19v-2a4 4 0 0 0-3-3.8" },
        ]
    },
    {
        group: "Academy", items: [
            { to: "/owner/batches", label: "Batches", icon: "M3 5h18M3 12h18M3 19h18" },
            { to: "/owner/attendance", label: "Attendance", icon: "M5 12l5 5 9-10" },
            { to: "/owner/performance", label: "Performance", icon: "M5 20V10M12 20V4M19 20v-7" },
        ]
    },
    { group: "Competition", items: [{ to: "/owner/tournaments", label: "Tournaments", icon: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" }] },
    { items: [{ to: "/owner/settings", label: "Settings", icon: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4" }] },
    {
        items:[{to:"/logout",label:"logout",icon:""}]
    }
];
const TITLES = Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i.to, i.label])));

function Icon({ d }) {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}

export default function DashboardO({ user = { name: "Academy Owner", initials: "AO" } }) {
    const [open, setOpen] = useState(false);
    const [ready, setReady] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem("sp-theme") || "dark");
    const { pathname } = useLocation();

    useEffect(() => { ensureSeed().then(() => setReady(true)); }, []);
    useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("sp-theme", theme); }, [theme]);
    useEffect(() => setOpen(false), [pathname]);

    const title = TITLES[pathname] || TITLES["/" + pathname.split("/").slice(1, 3).join("/")] || "Overview";

    return (
        <div className="dash">
            <aside className={`dash-side ${open ? "is-open" : ""}`} aria-label="Owner navigation">
                <div className="dash-logo">SMASHPOINT <span>OWNER</span></div>
                {NAV.map((g, i) => (
                    <div key={i}>
                        {g.group && <div className="dash-group">{g.group}</div>}
                        {g.items.map((it) => (
                            <NavLink key={it.to} to={it.to} className={({ isActive }) => `dash-link ${isActive ? "is-active" : ""}`}><Icon d={it.icon} />{it.label}</NavLink>
                        ))}
                    </div>
                ))}
            </aside>
            {open && <button className="dash-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
            <div className="dash-body">
                <header className="dash-top">
                    <button className="dash-icon dash-burger" onClick={() => setOpen(true)} aria-label="Open menu"><Icon d="M3 6h18M3 12h18M3 18h18" /></button>
                    <h1 className="dash-title">{title}</h1>
                    <div style={{ flex: 1 }} />
                    <div className="dash-actions">
                        <button className="dash-icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Switch theme"><Icon d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" /></button>
                        <span className="dash-avatar" title={user.name}>{user.initials}</span>
                    </div>
                </header>
                <main className="dash-page">{ready ? <Outlet /> : <p className="o-empty" style={{ color: "var(--muted,#8b95a9)" }}>Loading academy data…</p>}</main>
            </div>
        </div>
    );
}
