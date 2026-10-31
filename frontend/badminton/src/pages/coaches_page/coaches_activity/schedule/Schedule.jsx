
import "./schedule.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess";
export default function Schedule() {
  const {coach,batches,players,loading}=useCoachData();
  if(loading)return <div className="sc">Loading your schedule…</div>;
  if(!coach)return <div className="sc">Coach account is not linked.</div>;
  const week=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  return <div className="sc">{week.map(day=>{const short=day.slice(0,3);const list=batches.filter(b=>b.days?.includes(short)).sort((a,b)=>(a.time||"").localeCompare(b.time||""));
    return <section className="sc-day" key={day}><h2>{day}</h2>{list.length?list.map(b=><div className="sc-slot" key={b.id}><b>{b.time}</b><span>{b.name}</span><em>Court {b.court||"—"} · {players.filter(p=>p.batchId===b.id&&p.status==="Active").length} players</em></div>):<p>No assigned session.</p>}</section>})}</div>;
}
