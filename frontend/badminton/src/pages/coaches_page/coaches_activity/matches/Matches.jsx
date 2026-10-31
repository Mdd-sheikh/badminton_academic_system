
import { useState } from "react";
import "./Matches.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess";
export default function Matches() {
  const {coach,players,tournaments,matches,loading}=useCoachData();
  const [tab,setTab]=useState("Upcoming");
  const ids=new Set(players.map(p=>p.id));
  const filtered=matches.filter(m=>{const t=tournaments.find(x=>x.id===m.tournamentId);return t?.entrants?.some(e=>e.members?.some(id=>ids.has(id)))});
  const rows=filtered.filter(m=>(m.status==="completed"?"Completed":"Upcoming")===tab).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  const label=(m,side)=>{const t=tournaments.find(x=>x.id===m.tournamentId);return t?.entrants?.find(e=>e.id===m[side])?.name||"TBD"};
  if(loading)return <div className="mt">Loading matches…</div>;
  if(!coach)return <div className="mt">Coach account is not linked.</div>;
  return <div className="mt"><div className="mt-tabs" role="tablist">{["Upcoming","Completed"].map(t=><button key={t} role="tab" aria-selected={tab===t} className={tab===t?"is-on":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {rows.map(m=><div className="mt-row" key={m.id}><b>{label(m,"a")}</b><span>vs</span><b>{label(m,"b")}</b><em>{m.date||"Date TBC"} · {m.time||m.status}{m.score?` · ${JSON.stringify(m.score)}`:""}</em></div>)}
    {!rows.length&&<p className="mt-empty">No {tab.toLowerCase()} matches involving players from your assigned batches.</p>}
  </div>;
}
