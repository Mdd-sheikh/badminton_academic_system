
import "./Coach_Home.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess";
import { todayISO, DOW } from "../../../academy_owner/db/util.js";
export default function Coach_Home() {
  const { coach, batches, players, attendance, performance, loading } = useCoachData();
  const today = todayISO(), dow = DOW[new Date(`${today}T00:00:00`).getDay()];
  const sessions = batches.filter(b => b.days?.includes(dow));
  const active = players.filter(p => p.status === "Active");
  const todayAtt = attendance.filter(a => a.date === today);
  const marks = todayAtt.flatMap(a => Object.values(a.marks || {}));
  const total = attendance.reduce((s, a) => s + Object.keys(a.marks || {}).length, 0);
  const attended = attendance.reduce((s, a) => s + Object.values(a.marks || {}).filter(v => v === "P" || v === "L").length, 0);
  const avg = total ? Math.round(attended / total * 100) : 0;
  const stats = [["Assigned players", active.length], ["Assigned batches", batches.length], ["Today's sessions", sessions.length], ["Attendance average", total ? `${avg}%` : "—"]];
  if (loading) return <div className="home">Loading coach dashboard…</div>;
  if (!coach) return <div className="home"><div className="home-card"><h2>Coach account not linked</h2><p>Match your login email/phone with the coach profile or pass coachId in Outlet context.</p></div></div>;
  return <div className="home">
    <div className="home-welcome"><span>COACH WORKSPACE</span><h2>Welcome, {coach.name}</h2><p>Here is the latest activity from your assigned batches.</p></div>
    <div className="home-stats">{stats.map(([l, v]) => <div className="home-card" key={l}><span className="home-num">{v}</span><span className="home-lbl">{l}</span></div>)}</div>
    <div className="home-cols">
      <section className="home-card"><h2>Today's assigned sessions</h2>{sessions.length ? sessions.map(b => <div className="home-row" key={b.id}><b>{b.time}</b><span>{b.name}</span><em>Court {b.court || "—"} · {players.filter(p => p.batchId === b.id && p.status === "Active").length} active players</em></div>) : <p className="home-muted">No regular sessions scheduled today.</p>}</section>
      <section className="home-card"><h2>Today's attendance</h2><div className="home-num">{marks.length ? `${Math.round(marks.filter(x => x === "P" || x === "L").length / marks.length * 100)}%` : "—"}</div><p className="home-muted">{marks.length} players marked across {todayAtt.length} batches.</p><h2>Recent evaluations</h2>{performance.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 4).map(p => <p className="home-muted" key={p.id}>{players.find(x => x.id === p.playerId)?.name} · {p.month}</p>)}</section>
    </div>
  </div>;
}
