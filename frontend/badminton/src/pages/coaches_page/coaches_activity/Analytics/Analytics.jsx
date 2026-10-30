import "./Analytics.css";
const attendance = [["Mon", 88], ["Tue", 82], ["Wed", 91], ["Thu", 79], ["Fri", 85], ["Sat", 94]];
const skills = [["Footwork", 72], ["Smash power", 65], ["Net play", 78], ["Endurance", 70]];
export default function Analytics() {
  return (
    <div className="an">
      <section className="an-card">
        <h2>Attendance this week (%)</h2>
        <div className="an-bars">
          {attendance.map(([d, v]) => (<div key={d} className="an-col"><span>{v}</span><i style={{ height: v + "%" }} /><b>{d}</b></div>))}
        </div>
      </section>
      <section className="an-card">
        <h2>Average skill rating</h2>
        {skills.map(([s, v]) => (
          <div className="an-skill" key={s}><span>{s}</span><div className="an-track"><i style={{ width: v + "%" }} /></div><b>{v}</b></div>
        ))}
      </section>
    </div>
  );
}
