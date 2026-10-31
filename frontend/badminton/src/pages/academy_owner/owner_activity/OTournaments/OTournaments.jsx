import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useStore, save, uid, addDays, todayISO, fmtDate } from "../../db/db.js";
import { Modal, Tag, Empty } from "../../Ui/Ui.jsx";
import TournamentForm from "../TournamentForm/TournamentForm.jsx";

const LABEL = { registration: "Upcoming", ongoing: "Ongoing", completed: "Completed" };

export default function OTournaments() {
    const [ts] = useStore("tournaments"),
        [ms] = useStore("matches");
    const [tab, setTab] = useState("all"),
        [open, setOpen] = useState(false);
    const nav = useNavigate();
    const rows = ts.filter((t) => tab === "all" || t.status === tab).sort((a, b) => b.start.localeCompare(a.start));
    const blank = { name: "", start: addDays(todayISO(), 14), end: addDays(todayISO(), 16), venue: "", courts: 4, category: "Singles · Open", entrantType: "singles", format: "knockout", rules: "Best of 3 sets to 21, rally scoring." };

    const create = async (f) => {
        const t = { ...f, id: uid("t"), status: "registration", championId: null, entrants: [] };
        await save("tournaments", t); toast.success("Tournament created");
        nav(`/owner/tournaments/${t.id}`);
    };

    return (
        <div className="o-page">
            <div className="o-bar">
                <div className="o-tabs grow">{[["all", "All"], ["ongoing", "Ongoing"], ["registration", "Upcoming"], ["completed", "Completed"]].map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l} ({k === "all" ? ts.length : ts.filter((t) => t.status === k).length})</button>)}</div>
                <button className="o-btn" onClick={() => setOpen(true)}>Create tournament</button>
            </div>
            <div className="o-grid">
                {rows.map((t) => {
                    const m = ms.filter((x) => x.tournamentId === t.id && !x.bye), done = m.filter((x) => x.status === "completed").length;
                    return (
                        <Link to={`/owner/tournaments/${t.id}`} key={t.id} className="o-card" style={{ color: "inherit", textDecoration: "none" }}>
                            <div className="o-rowline" style={{ border: 0, padding: 0 }}><h2>{t.name}</h2><Tag tone={t.status === "ongoing" ? "ok" : ""}>{LABEL[t.status]}</Tag></div>
                            <p className="o-lbl">{fmtDate(t.start)} to {fmtDate(t.end)} · {t.venue}</p>
                            <p className="o-lbl">{t.category} · {t.format === "knockout" ? "Knockout" : "League"} · {t.entrants.length} entrants</p>
                            {m.length > 0 && <><div className="o-track"><i style={{ width: (done / m.length) * 100 + "%" }} /></div><span className="o-lbl">{done} of {m.length} matches played</span></>}
                            {t.championId && <span className="o-lbl">Winner: <b style={{ color: "var(--c-acc)" }}>{t.entrants.find((e) => e.id === t.championId)?.name}</b></span>}
                        </Link>
                    );
                })}
            </div>
            {!rows.length && <Empty text="No tournaments here yet." />}
            {open && <Modal title="Create tournament" onClose={() => setOpen(false)} wide><TournamentForm initial={blank} onSubmit={create} onCancel={() => setOpen(false)} /></Modal>}
        </div>
    );
}
