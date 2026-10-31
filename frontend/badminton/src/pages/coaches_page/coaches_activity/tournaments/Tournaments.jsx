
import "./Tournaments.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess";
import { fmtDate } from "../../../academy_owner/db/util";
export default function Tournaments() {
  const {coach,players,tournaments,loading}=useCoachData();const ids=new Set(players.map(p=>p.id));
  if(loading)return <div className="tn">Loading tournaments…</div>;
  if(!coach)return <div className="tn">Coach account is not linked.</div>;
  return <div className="tn">{tournaments.map(t=>{const entrants=t.entrants?.filter(e=>e.members?.some(id=>ids.has(id)))||[];
    return <article className="tn-card" key={t.id}><span className={`tn-state ${t.status==="completed"?"is-done":""}`}>{t.status}</span><h2>{t.name}</h2><p>{fmtDate(t.start)} – {fmtDate(t.end)}</p><p>{t.venue}</p><small>{entrants.length} participating entries from your assigned batches</small></article>})}
    {!tournaments.length&&<p>No tournament participation for your assigned players yet.</p>}</div>;
}
