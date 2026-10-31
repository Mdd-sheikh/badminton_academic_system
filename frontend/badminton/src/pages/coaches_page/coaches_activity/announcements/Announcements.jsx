
import { useEffect, useState } from "react";
import "./Announcements.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess.js";
export default function Announcements() {
  const {coach,batches,loading}=useCoachData();
  const [items,setItems]=useState([]);const [f,setF]=useState({title:"",body:"",to:"all"});
  const key=`sp-coach-announcements-${coach?.id||"unlinked"}`;
  useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem(key)||"[]"))}catch{setItems([])}},[key]);
  const send=e=>{e.preventDefault();if(!f.title.trim())return;const item={id:Date.now(),...f,by:coach?.name||"Coach",createdAt:new Date().toISOString()};const next=[item,...items];setItems(next);localStorage.setItem(key,JSON.stringify(next));setF({title:"",body:"",to:"all"});};
  if(loading)return <div className="an2">Loading assigned batches…</div>;
  if(!coach)return <div className="an2">Coach account is not linked.</div>;
  return <div className="an2"><form className="an2-form" onSubmit={send}><h2>New announcement</h2>
    <input value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Title" aria-label="Title" required/>
    <textarea rows="4" value={f.body} onChange={e=>setF({...f,body:e.target.value})} placeholder="Message" aria-label="Message"/>
    <select value={f.to} onChange={e=>setF({...f,to:e.target.value})}><option value="all">All my assigned batches</option>{batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
    <button type="submit" disabled={!batches.length}>Send announcement</button></form>
    <div className="an2-list">{items.map(i=><article key={i.id}><h3>{i.title}</h3><p>{i.body}</p><small>Sent by {i.by} · {i.to==="all"?"All assigned batches":batches.find(b=>b.id===i.to)?.name||"Assigned batch"}</small></article>)}</div>
  </div>;
}
