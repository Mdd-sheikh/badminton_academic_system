
import { useEffect, useState } from "react";
import "./Notifications.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess.js";
export default function Notifications() {
  const {coach,batches,attendance,loading}=useCoachData();
  const [read,setRead]=useState([]);
  const key=`sp-coach-notification-read-${coach?.id||"unlinked"}`;
  useEffect(()=>{try{setRead(JSON.parse(localStorage.getItem(key)||"[]"))}catch{setRead([])}},[key]);
  const notices=batches.map(b=>{const recent=attendance.filter(a=>a.batchId===b.id).sort((a,b)=>b.date.localeCompare(a.date))[0];if(!recent)return null;const vals=Object.values(recent.marks||{});const pct=vals.length?Math.round(vals.filter(v=>v==="P"||v==="L").length/vals.length*100):100;return pct<75?{id:`low-${b.id}-${recent.date}`,text:`${b.name} attendance was ${pct}% on ${recent.date}.`,time:recent.date}:null}).filter(Boolean);
  const unread=notices.filter(n=>!read.includes(n.id)).length;
  const mark=id=>{const next=[...read,id];setRead(next);localStorage.setItem(key,JSON.stringify(next))};
  if(loading)return <div className="nt">Loading coach notifications…</div>;
  if(!coach)return <div className="nt">Coach account is not linked.</div>;
  return <div className="nt"><div className="nt-head"><p>{unread} unread · generated from your assigned batch records</p><button disabled={!unread} onClick={()=>{const next=[...read,...notices.map(n=>n.id)];setRead(next);localStorage.setItem(key,JSON.stringify(next))}}>Mark all as read</button></div>
    {notices.map(n=><div key={n.id} className={`nt-item ${read.includes(n.id)?"":"is-new"}`}><div><p>{n.text}</p><small>{n.time}</small></div>{!read.includes(n.id)&&<button onClick={()=>mark(n.id)}>Mark as read</button>}</div>)}
    {!notices.length&&<p className="nt-empty">No attendance alerts for your assigned batches.</p>}
  </div>;
}
