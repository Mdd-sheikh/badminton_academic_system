
import { useEffect, useState } from "react";
import "./Settings.css";
import { useCoachData } from "../../../academy_owner/db/coachAccess.js";
export default function Settings() {
  const {coach,loading}=useCoachData();const [s,setS]=useState({name:"",email:"",phone:"",matchAlerts:true,attendanceAlerts:true,weeklyEmail:false});const [saved,setSaved]=useState(false);
  const key=`sp-coach-settings-${coach?.id||"unlinked"}`;
  useEffect(()=>{if(!coach)return;let stored={};try{stored=JSON.parse(localStorage.getItem(key)||"{}")}catch{}setS(v=>({...v,name:coach.name||"",email:coach.email||"",phone:coach.phone||"",...stored}))},[coach,key]);
  const set=(k,v)=>{setSaved(false);setS(old=>({...old,[k]:v}))};
  if(loading)return <div className="st">Loading coach profile…</div>;
  if(!coach)return <div className="st">Coach account is not linked.</div>;
  return <form className="st" onSubmit={e=>{e.preventDefault();localStorage.setItem(key,JSON.stringify({matchAlerts:s.matchAlerts,attendanceAlerts:s.attendanceAlerts,weeklyEmail:s.weeklyEmail}));setSaved(true)}}>
    <section><h2>Coach profile</h2><p className="st-help">Profile details are managed by the academy owner.</p>
      {[["name","Full name"],["email","Email"],["phone","Phone"]].map(([k,l])=><label key={k} className="st-field"><span>{l}</span><input value={s[k]} readOnly /></label>)}</section>
    <section><h2>Notification preferences</h2>{[["matchAlerts","Match reminders"],["attendanceAlerts","Low attendance alerts"],["weeklyEmail","Weekly summary email"]].map(([k,l])=><label key={k} className="st-switch"><span>{l}</span><input type="checkbox" checked={s[k]} onChange={e=>set(k,e.target.checked)}/></label>)}</section>
    <button type="submit">Save preferences</button>{saved&&<p role="status" className="st-ok">Preferences saved on this device.</p>}
  </form>;
}
