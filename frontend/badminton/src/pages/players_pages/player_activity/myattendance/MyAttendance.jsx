import "./MyAttendance.css";
const D = [["Mon 26 Oct", true], ["Sat 24 Oct", true], ["Thu 22 Oct", false], ["Tue 20 Oct", true], ["Sat 17 Oct", true], ["Thu 15 Oct", true], ["Tue 13 Oct", false]];
export default function MyAttendance() {
  const n = D.filter(([, p]) => p).length;
  const pct = Math.round((n / D.length) * 100);
  return (
    <div className="mat">
      <section className="mat-card"><span className="mat-num">{pct}%</span>
        <p>You attended {n} of {D.length} recent sessions</p>
        <div className="mat-track"><i style={{ width: pct + "%" }} /></div>
      </section>
      <ul className="mat-card mat-list">
        {D.map(([d, p]) => (<li key={d}><span>{d}</span><b className={p ? "is-in" : "is-out"}>{p ? "Present" : "Absent"}</b></li>))}
      </ul>
    </div>
  );
}
