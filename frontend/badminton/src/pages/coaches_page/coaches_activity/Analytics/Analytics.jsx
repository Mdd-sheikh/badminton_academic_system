
import "./Analytics.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess.js";
import { addDays, todayISO, METRICS } from "../../../academy_owner/db/util.js";
export default function Analytics() {
  const { coach, batches, players, attendance, performance, loading } = useCoachData();
  const today = todayISO(); const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const daily = week.map(date => { const recs = attendance.filter(a => a.date === date); const marks = recs.flatMap(a => Object.values(a.marks || {})); const present = marks.filter(x => x === "P" || x === "L").length; return [new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" }), marks.length ? Math.round(present / marks.length * 100) : 0, marks.length] });
  const latest = performance.slice().sort((a, b) => b.month.localeCompare(a.month));
  const metrics = METRICS.map(([key, label]) => { const vals = latest.map(p => p.metrics?.[key]).filter(v => typeof v === "number"); return [label, vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0] });
  if (loading) return <div className="an">Loading assigned batch analytics…</div>;
  if (!coach) return <div className="an">Coach account is not linked.</div>;
  return <div className="an">
    <section className="an-card"><h2>Attendance · last 7 days</h2><p className="an-sub">Calculated from daily attendance saved for your batches.</p>
      <div className="an-bars">{daily.map(([d, v, n]) => <div key={d} className="an-col"><span>{n ? `${v}%` : "—"}</span><i style={{ height: `${v}%` }} /><b>{d}</b></div>)}</div></section>
    <section className="an-card"><h2>Average skill rating</h2><p className="an-sub">Average of recorded player evaluations in assigned batches.</p>
      {metrics.map(([s, v]) => <div className="an-skill" key={s}><span>{s}</span><div className="an-track"><i style={{ width: `${v}%` }} /></div><b>{v || "—"}</b></div>)}
      {!performance.length && <p className="an-sub">No performance evaluations have been saved yet.</p>}</section>
    <section className="an-card"><h2>Scope summary</h2><p>{batches.length} assigned batches · {players.length} players · {attendance.length} attendance sessions · {performance.length} evaluations</p></section>
  </div>;
}
