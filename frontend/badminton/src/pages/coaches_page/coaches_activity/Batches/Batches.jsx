
import "./Batches.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess.js";
export default function Batches() {
  const { coach, batches, players, loading } = useCoachData();
  if (loading) return <div className="bt">Loading assigned batches…</div>;
  if (!coach) return <div className="bt">Coach account is not linked.</div>;
  return <div className="bt"><div className="bt-head"><p>{batches.length} assigned batches · {coach.name}</p></div>
    <div className="bt-grid">{batches.map(b => {
      const count = players.filter(p => p.batchId === b.id && p.status === "Active").length; const pct = b.capacity ? Math.round(count / b.capacity * 100) : 0;
      return <article className="bt-card" key={b.id}><h2>{b.name}</h2><p>{b.level} · {b.days?.join(", ")}</p><p>{b.time} · Court {b.court || "—"}</p>
        <div className="bt-track" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"><i style={{ width: `${Math.min(100, pct)}%` }} /></div>
        <span>{count} active players of {b.capacity ?? "—"} capacity</span></article>
    })}
      {!batches.length && <p>No batches assigned yet. Contact the academy owner.</p>}</div></div>;
}
