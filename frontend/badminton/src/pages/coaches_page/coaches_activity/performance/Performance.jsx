
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { save } from "../../../academy_owner/db/db";
import { METRICS, avgOf, todayISO } from "../../../academy_owner/db/util";
import { useCoachData } from "../../../academy_owner/db/coachAccess";
import "./Performance.css";

export default function Performance() {
    const { coach, batches, players, performance, loading } = useCoachData();
    const [batchId, setBatchId] = useState("");
    const [playerId, setPlayerId] = useState("");
    const [month, setMonth] = useState(todayISO().slice(0, 7));
    const [values, setValues] = useState({});
    const [note, setNote] = useState("");
    const batch = batches.find(b => b.id === batchId) || batches[0] || null;
    const roster = players.filter(p => p.batchId === batch?.id && p.status === "Active").sort((a, b) => a.name.localeCompare(b.name));
    const player = roster.find(p => p.id === playerId) || roster[0] || null;
    const record = player && performance.find(p => p.id === `${player.id}|${month}`);
    const history = useMemo(() => player ? performance.filter(p => p.playerId === player.id).sort((a, b) => a.month.localeCompare(b.month)) : [], [performance, player]);
    useEffect(() => { if (!batchId && batches[0]) setBatchId(batches[0].id) }, [batchId, batches]);
    useEffect(() => { if (player && !roster.some(p => p.id === playerId)) setPlayerId(player.id) }, [player, playerId, roster]);
    useEffect(() => { setValues(record ? { ...record.metrics } : Object.fromEntries(METRICS.map(([k]) => [k, 50]))); setNote(record?.note || "") }, [player?.id, month, record?.updatedAt]);
    const submit = async () => {
        if (!player) return;
        await save("performance", { id: `${player.id}|${month}`, playerId: player.id, month, metrics: values, note, by: coach?.name || "Coach", updatedAt: new Date().toISOString() });
        toast.success(record ? "Performance evaluation updated." : "Performance evaluation saved.");
    };
    if (loading) return <div className="pm">Loading assigned players…</div>;
    if (!coach) return <div className="pm pm-empty">Coach account is not linked. Sign in with your coach profile email/phone or pass coachId.</div>;
    if (!batches.length) return <div className="pm pm-empty">No batches assigned to this coach.</div>;
    return <div className="pm">
        <header className="pm-head"><div><span>COACH TOOLS</span><h2>Player performance</h2><p>Evaluate only players in your assigned batches.</p></div><b>{coach.name}</b></header>
        <div className="pm-toolbar">
            <label>Assigned batch<select value={batch?.id || ""} onChange={e => { setBatchId(e.target.value); setPlayerId("") }}>{batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
            <label>Player<select value={player?.id || ""} onChange={e => setPlayerId(e.target.value)}>{roster.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <label>Evaluation month<input type="month" max={todayISO().slice(0, 7)} value={month} onChange={e => e.target.value && setMonth(e.target.value)} /></label>
        </div>
        {!player ? <p className="pm-empty">No active players in this batch.</p> : <div className="pm-grid">
            <section className="pm-card">
                <div className="pm-player-head"><div><small>PLAYER EVALUATION</small><h3>{player.name}</h3></div><span>{record ? "Saved evaluation" : "New evaluation"}</span></div>
                {METRICS.map(([key, label]) => <div className="pm-metric" key={key}><div><label htmlFor={`metric-${key}`}>{label}</label><b>{values[key] ?? 0}/100</b></div><input id={`metric-${key}`} type="range" min="0" max="100" value={values[key] ?? 0} onChange={e => setValues(v => ({ ...v, [key]: Number(e.target.value) }))} /></div>)}
                <label className="pm-note">Coach notes<textarea rows="4" value={note} onChange={e => setNote(e.target.value)} placeholder="Training observations, strengths, areas to improve…" /></label>
                <div className="pm-submit"><span>Overall score <strong>{avgOf(values)}/100</strong></span><button onClick={submit}>Save evaluation</button></div>
            </section>
            <section className="pm-card"><h3>Progress history</h3>{history.length ? history.map(h => <div className="pm-history" key={h.id}><span>{h.month}</span><div><i style={{ width: `${avgOf(h.metrics)}%` }} /></div><b>{avgOf(h.metrics)}</b></div>) : <p className="pm-empty">No previous evaluations.</p>}</section>
        </div>}
    </div>;
}
