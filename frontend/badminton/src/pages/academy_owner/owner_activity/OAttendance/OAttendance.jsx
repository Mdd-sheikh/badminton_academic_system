import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useStore, save, iso, todayISO, addDays, fmtDate, DOW } from "../../db/db.js";
import { Modal, Tag, Empty } from "../../Ui/Ui.jsx";

export default function OAttendance() {
    const [batches] = useStore("batches"), [players] = useStore("players"), [att] = useStore("attendance");
    const [tab, setTab] = useState("cal"), [batchF, setBatchF] = useState("all"), [edit, setEdit] = useState(null);
    return (
        <div className="o-page">
            <div className="o-bar">
                <div className="o-tabs">{[["cal", "Calendar"], ["rep", "History & reports"]].map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</div>
                <select value={batchF} onChange={(e) => setBatchF(e.target.value)} aria-label="Batch"><option value="all">All batches</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
            </div>
            {tab === "cal" ? <Calendar {...{ batches, att, batchF }} onEdit={(date, batchId) => setEdit({ date, batchId })} /> : <Report {...{ batches, players, att, batchF }} onEdit={(date, batchId) => setEdit({ date, batchId })} />}
            {edit && <MarkModal {...edit} {...{ batches, players, att }} onClose={() => setEdit(null)} defaultBatch={batchF} />}
        </div>
    );
}

function Calendar({ batches, att, batchF, onEdit }) {
    const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
    const today = todayISO();
    const byDate = useMemo(() => { const m = {}; att.forEach((a) => { if (batchF === "all" || a.batchId === batchF) (m[a.date] ??= []).push(a); }); return m; }, [att, batchF]);
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = [...Array(month.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => iso(new Date(month.getFullYear(), month.getMonth(), i + 1)))];
    const sched = (ds) => batches.filter((b) => (batchF === "all" || b.id === batchF) && b.days.includes(DOW[new Date(ds + "T00:00").getDay()]));
    const move = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

    return (
        <section className="o-card">
            <div className="o-bar"><button className="o-btn ghost sm" onClick={() => move(-1)} aria-label="Previous month">‹</button><h2 className="grow" style={{ textAlign: "center" }}>{month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h2><button className="o-btn ghost sm" onClick={() => move(1)} aria-label="Next month">›</button></div>
            <div className="o-cal">
                {DOW.map((d) => <div className="h" key={d}>{d}</div>)}
                {cells.map((ds, i) => {
                    if (!ds) return <div key={i} />;
                    const recs = byDate[ds] || []; let p = 0, t = 0;
                    recs.forEach((r) => Object.values(r.marks).forEach((s) => { t++; if (s !== "A") p++; }));
                    const pct = t ? Math.round((p / t) * 100) : null, future = ds > today, s = sched(ds);
                    return (
                        <button key={ds} className={`o-day ${ds === today ? "is-today" : ""}`} disabled={future} onClick={() => onEdit(ds, batchF === "all" ? (recs[0]?.batchId || s[0]?.id) : batchF)}>
                            <b>{+ds.slice(8)}</b>
                            {pct != null ? <><small>{pct}% present</small><i className={pct >= 85 ? "" : pct >= 70 ? "mid" : "low"} style={{ width: pct + "%" }} /></> : s.length && !future ? <small>Not marked</small> : null}
                        </button>
                    );
                })}
            </div>
            <p className="o-lbl">Click a day to mark or override attendance. Green is 85% or more, amber 70 to 84%, red below 70%.</p>
        </section>
    );
}

function MarkModal({ date, batchId, batches, players, att, onClose, defaultBatch }) {
    const dow = DOW[new Date(date + "T00:00").getDay()];
    const ordered = [...batches].sort((a, b) => Number(b.days.includes(dow)) - Number(a.days.includes(dow)));
    const [bid, setBid] = useState(batchId || ordered[0]?.id);
    const existing = att.find((a) => a.id === `${bid}|${date}`);
    const roster = players.filter((p) => p.batchId === bid && (p.status === "Active" || existing?.marks[p.id]));
    const [marks, setMarks] = useState({});
    useEffect(() => { setMarks(existing ? { ...existing.marks } : Object.fromEntries(roster.map((p) => [p.id, "P"]))); }, [bid, date]); // eslint-disable-line

    const submit = async () => {
        await save("attendance", { id: `${bid}|${date}`, batchId: bid, date, marks, by: "Owner", overridden: !!existing && !existing.by.startsWith("Owner"), updatedAt: todayISO() });
        toast.success(existing ? "Attendance updated" : "Attendance saved");
        onClose();
    };
    const all = (s) => setMarks(Object.fromEntries(roster.map((p) => [p.id, s])));
    const cnt = (s) => Object.values(marks).filter((x) => x === s).length;

    return (
        <Modal title={`Attendance · ${fmtDate(date)}`} onClose={onClose} wide>
            <div className="o-bar">
                {defaultBatch === "all" || !defaultBatch ? <select value={bid} onChange={(e) => setBid(e.target.value)} aria-label="Batch">{ordered.map((b) => <option key={b.id} value={b.id}>{b.name}{b.days.includes(dow) ? " (scheduled)" : ""}</option>)}</select> : <b>{batches.find((b) => b.id === bid)?.name}</b>}
                {existing && <Tag>Last saved by {existing.by}</Tag>}
                <span className="grow" />
                <button className="o-btn ghost sm" onClick={() => all("P")}>All present</button><button className="o-btn ghost sm" onClick={() => all("A")}>All absent</button>
            </div>
            <div className="o-pick" style={{ maxHeight: 340 }}>
                {roster.map((p) => (
                    <div className="o-rowline" key={p.id} style={{ padding: "8px 12px" }}>
                        <span>{p.name}</span>
                        <div className="o-mark">{[["P", "Present"], ["L", "Late"], ["A", "Absent"]].map(([k, l]) => <button key={k} className={`${k} ${marks[p.id] === k ? "on" : ""}`} onClick={() => setMarks({ ...marks, [p.id]: k })} aria-pressed={marks[p.id] === k}>{l}</button>)}</div>
                    </div>
                ))}
                {!roster.length && <Empty text="No players in this batch." />}
            </div>
            <div className="o-actions"><span className="o-lbl grow">{cnt("P")} present · {cnt("L")} late · {cnt("A")} absent</span><button className="o-btn ghost" onClick={onClose}>Cancel</button><button className="o-btn" disabled={!roster.length} onClick={submit}>{existing ? "Save override" : "Save attendance"}</button></div>
        </Modal>
    );
}

function Report({ batches, players, att, batchF, onEdit }) {
    const [from, setFrom] = useState(addDays(todayISO(), -30)), [to, setTo] = useState(todayISO()), [q, setQ] = useState("");
    const recs = att.filter((a) => a.date >= from && a.date <= to && (batchF === "all" || a.batchId === batchF)).sort((a, b) => b.date.localeCompare(a.date));
    const per = {};
    recs.forEach((r) => Object.entries(r.marks).forEach(([id, s]) => { (per[id] ??= { P: 0, L: 0, A: 0 })[s]++; }));
    const rows = players.filter((p) => per[p.id] && p.name.toLowerCase().includes(q.toLowerCase())).map((p) => { const x = per[p.id], n = x.P + x.L + x.A; return { p, ...x, n, pct: Math.round(((x.P + x.L) / n) * 100) }; }).sort((a, b) => a.pct - b.pct);
    const bn = (id) => batches.find((b) => b.id === id)?.name;

    const exportCsv = () => {
        const csv = ["Player,Batch,Sessions,Present,Late,Absent,Attendance %", ...rows.map((r) => `"${r.p.name}","${bn(r.p.batchId) || ""}",${r.n},${r.P},${r.L},${r.A},${r.pct}`)].join("\n");
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `attendance_${from}_to_${to}.csv`; a.click();
    };

    return (
        <>
            <div className="o-bar">
                <label className="o-lbl">From <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label>
                <label className="o-lbl">To <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
                <input className="grow" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search player" aria-label="Search player" />
                <button className="o-btn ghost" onClick={exportCsv} disabled={!rows.length}>Export CSV</button>
            </div>
            <div className="o-wrap"><table>
                <thead><tr><th>Player</th><th>Batch</th><th>Sessions</th><th>Present</th><th>Late</th><th>Absent</th><th>Attendance</th></tr></thead>
                <tbody>{rows.map((r) => <tr key={r.p.id}><td>{r.p.name}</td><td>{bn(r.p.batchId)}</td><td>{r.n}</td><td>{r.P}</td><td>{r.L}</td><td>{r.A}</td><td><Tag tone={r.pct >= 85 ? "ok" : r.pct < 70 ? "warn" : ""}>{r.pct}%</Tag></td></tr>)}</tbody>
            </table>{!rows.length && <Empty text="No attendance records in this range." />}</div>
            <h2>Session history ({recs.length})</h2>
            <div className="o-wrap"><table>
                <thead><tr><th>Date</th><th>Batch</th><th>Present</th><th>Late</th><th>Absent</th><th>Marked by</th><th /></tr></thead>
                <tbody>{recs.slice(0, 60).map((r) => { const v = Object.values(r.marks); return <tr key={r.id}><td>{fmtDate(r.date)}</td><td>{bn(r.batchId)}</td><td>{v.filter((x) => x === "P").length}</td><td>{v.filter((x) => x === "L").length}</td><td>{v.filter((x) => x === "A").length}</td><td>{r.by}{r.overridden && <> <Tag tone="warn">Overridden</Tag></>}</td><td><button className="o-btn ghost sm" onClick={() => onEdit(r.date, r.batchId)}>Edit</button></td></tr>; })}</tbody>
            </table>{recs.length > 60 && <p className="o-lbl" style={{ padding: 12 }}>Showing the latest 60 sessions. Narrow the date range to see more.</p>}</div>
        </>
    );
}
