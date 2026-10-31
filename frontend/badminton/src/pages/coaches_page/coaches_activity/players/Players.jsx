
import { useState } from "react";
import "./Players.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess";
export default function Players() {
  const {coach,batches,players,loading}=useCoachData();
  const [q,setQ]=useState(""); const [batch,setBatch]=useState("all");
  const rows=players.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())&&(batch==="all"||p.batchId===batch));
  if(loading)return <div className="pl">Loading assigned players…</div>;
  if(!coach)return <div className="pl">Coach account is not linked.</div>;
  return <div className="pl">
    <div className="pl-bar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search assigned players" aria-label="Filter players"/>
      <select value={batch} onChange={e=>setBatch(e.target.value)} aria-label="Assigned batch"><option value="all">All my batches</option>{batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
      <span className="pl-scope">{rows.length} assigned players</span></div>
    <div className="pl-wrap"><table><thead><tr><th>Name</th><th>Age</th><th>Batch</th><th>Level</th><th>Status</th></tr></thead>
      <tbody>{rows.map(p=><tr key={p.id}><td>{p.name}</td><td>{p.age??"—"}</td><td>{batches.find(b=>b.id===p.batchId)?.name||"—"}</td><td>{batches.find(b=>b.id===p.batchId)?.level||"—"}</td><td><span className={`pl-tag pl-${String(p.status).toLowerCase()}`}>{p.status}</span></td></tr>)}
      {!rows.length&&<tr><td colSpan="5" className="pl-empty">No players found in your assigned batches.</td></tr>}</tbody></table></div>
  </div>;
}
