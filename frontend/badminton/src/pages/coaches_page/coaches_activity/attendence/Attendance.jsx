
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { save } from "../../../academy_owner/db/db.js";
import { DOW, todayISO, fmtDate, addDays } from "../../../academy_owner/db/util.js";
import { useCoachData } from "../../../academy_owner/db/coachAccess.js";
import "./Attendance.css";

const MARKS = [["P", "Present"], ["L", "Late"], ["A", "Absent"]];
const monthLabel = (value) => new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

export default function Attendance() {
  const { coach, batches, players, attendance, loading } = useCoachData();
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(todayISO().slice(0, 7));

  const batch = batches.find((b) => b.id === batchId) || batches[0] || null;
  const roster = useMemo(() => players
    .filter((p) => p.batchId === batch?.id && p.status === "Active")
    .sort((a,b) => a.name.localeCompare(b.name)), [players, batch]);
  const existing = attendance.find((a) => a.id === `${batch?.id}|${date}`);
  const dayName = DOW[new Date(`${date}T00:00:00`).getDay()];
  const isScheduled = batch?.days?.includes(dayName);

  useEffect(() => {
    if (!batchId && batches[0]) setBatchId(batches[0].id);
  }, [batchId, batches]);

  useEffect(() => {
    const initial = {};
    roster.forEach((p) => { initial[p.id] = existing?.marks?.[p.id] || ""; });
    setMarks(initial);
  }, [batch?.id, date, players, attendance]);

  useEffect(() => setMonth(date.slice(0, 7)), [date]);

  const count = (key) => Object.values(marks).filter((v) => v === key).length;
  const setAll = (value) => setMarks(Object.fromEntries(roster.map((p) => [p.id, value])));

  const saveAttendance = async () => {
    if (!batch || !roster.length) return toast.error("No active players in this batch.");
    if (date > todayISO()) return toast.error("Attendance cannot be saved for a future date.");
    if (roster.some((p) => !marks[p.id])) return toast.error("Mark every player as Present, Late, or Absent.");
    setSaving(true);
    try {
      await save("attendance", {
        id: `${batch.id}|${date}`,
        batchId: batch.id,
        date,
        marks: Object.fromEntries(roster.map((p) => [p.id, marks[p.id]])),
        by: coach?.name || "Coach",
        updatedAt: new Date().toISOString(),
      });
      toast.success(existing ? "Attendance updated successfully." : "Daily attendance saved.");
    } catch (error) {
      console.error(error);
      toast.error("Could not save attendance. Please try again.");
    } finally { setSaving(false); }
  };

  const monthDays = useMemo(() => {
    const [y,m] = month.split("-").map(Number);
    const first = new Date(y,m-1,1);
    const offset = (first.getDay()+6)%7; // Monday-first calendar
    const days = new Date(y,m,0).getDate();
    return [...Array(offset).fill(null), ...Array.from({length:days},(_,i)=>`${month}-${String(i+1).padStart(2,"0")}`)];
  }, [month]);

  const sessionDates = new Set(attendance.filter((a) => a.batchId === batch?.id && a.date.startsWith(month)).map((a) => a.date));
  const changeMonth = (delta) => {
    const [y,m] = month.split("-").map(Number);
    const d = new Date(y,m-1+delta,1);
    setMonth(dateKey(d).slice(0,7));
  };

  if (loading) return <div className="at"><p>Loading assigned batches…</p></div>;
  if (!coach) return <div className="at at-empty"><h2>Coach account not linked</h2><p>Sign in with the email/phone linked to your coach profile, or pass <code>coachId</code> in the authenticated user.</p></div>;
  if (!batches.length) return <div className="at at-empty"><h2>No assigned batches</h2><p>Your academy owner has not assigned any batches to your coach profile yet.</p></div>;

  return <div className="at">
    <div className="at-heading"><div><span className="at-kicker">GROUND OPERATIONS</span><h2>Daily attendance</h2><p>Only players from your assigned batches are available here.</p></div>
      <span className="at-coach">{coach.name}</span></div>

    <div className="at-layout">
      <section className="at-panel at-calendar">
        <div className="at-calendar-head">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
          <strong>{monthLabel(month)}</strong>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button>
        </div>
        <div className="at-calendar-grid at-weekdays">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><span key={d}>{d}</span>)}</div>
        <div className="at-calendar-grid">
          {monthDays.map((d,i) => d
            ? <button type="button" key={d} className={`at-day ${date===d?"selected":""} ${sessionDates.has(d)?"has-record":""} ${d===todayISO()?"today":""}`}
                onClick={() => setDate(d)} disabled={d>todayISO()} title={sessionDates.has(d)?"Attendance saved":""}>
                {Number(d.slice(-2))}{sessionDates.has(d)&&<i/>}
              </button>
            : <span className="at-day-blank" key={`blank-${i}`} />)}
        </div>
        <div className="at-calendar-legend"><span><i className="saved-dot"/> Saved session</span><span><i className="today-dot"/> Today</span></div>
        <label className="at-date-input">Choose exact date<input type="date" value={date} max={todayISO()} onChange={(e)=>e.target.value&&setDate(e.target.value)}/></label>
      </section>

      <section className="at-panel at-register">
        <div className="at-bar">
          <label>Assigned batch<select value={batch?.id||""} onChange={(e)=>setBatchId(e.target.value)}>
            {batches.map((b)=><option key={b.id} value={b.id}>{b.name} · {b.time}</option>)}
          </select></label>
          <div className="at-selected-date"><small>Attendance date</small><strong>{fmtDate(date)}</strong><small>{dayName}{isScheduled?" · Scheduled session":" · Extra / rescheduled session"}</small></div>
        </div>
        {!isScheduled && <p className="at-notice">This date is not in the batch's regular training days. You can still record an extra or rescheduled ground session.</p>}
        <div className="at-counts"><span><b>{count("P")}</b> Present</span><span><b>{count("L")}</b> Late</span><span><b>{count("A")}</b> Absent</span><span><b>{roster.length}</b> Players</span></div>
        <div className="at-bulk"><span>Quick mark</span><button type="button" onClick={()=>setAll("P")}>All present</button><button type="button" onClick={()=>setAll("A")}>All absent</button><button type="button" onClick={()=>setAll("L")}>All late</button></div>
        <div className="at-roster-head"><strong>Player register</strong><span>{existing?"Previously saved · editable":"Not saved yet"}</span></div>
        <div className="at-list">
          {roster.map((p,index)=><article className="at-player" key={p.id}>
            <div className="at-player-info"><span className="at-index">{String(index+1).padStart(2,"0")}</span><div><strong>{p.name}</strong><small>{p.age ? `${p.age} years` : "Player"} · {p.status}</small></div></div>
            <div className="at-marks">{MARKS.map(([key,label])=><button key={key} type="button" className={`${key} ${marks[p.id]===key?"active":""}`} onClick={()=>setMarks((old)=>({...old,[p.id]:key}))} aria-pressed={marks[p.id]===key}>{label}</button>)}</div>
          </article>)}
          {!roster.length&&<p className="at-no-players">No active players assigned to this batch.</p>}
        </div>
        <div className="at-footer"><span>{Object.values(marks).filter(Boolean).length} / {roster.length} marked</span>
          <button className="at-save" type="button" onClick={saveAttendance} disabled={saving||!roster.length}>{saving?"Saving…":existing?"Update attendance":"Save daily attendance"}</button>
        </div>
      </section>
    </div>
  </div>;
}
