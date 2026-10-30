import "./ChildAttendance.css";
const DAYS = [["Mon 26 Oct", true], ["Sat 24 Oct", true], ["Thu 22 Oct", false], ["Tue 20 Oct", true], ["Sat 17 Oct", true], ["Thu 15 Oct", true], ["Tue 13 Oct", false]];
export default function ChildAttendance() {
  const present = DAYS.filter(([, p]) => p).length;
  const pct = Math.round((present / DAYS.length) * 100);
  return (
    <div className="pat">
      <section className="pat-card pat-sum">
        <span className="pat-num">{pct}%</span>
        <p>{present} of {DAYS.length} recent sessions attended</p>
        <div className="pat-track"><i style={{ width: pct + "%" }} /></div>
      </section>
      <ul className="pat-card pat-list">
        {DAYS.map(([d, p]) => (<li key={d}><span>{d}</span><b className={p ? "is-in" : "is-out"}>{p ? "Present" : "Absent"}</b></li>))}
      </ul>
    </div>
  );
}
