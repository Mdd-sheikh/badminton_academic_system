import "./MyPerformance.css";
const skills = [["Footwork", 72], ["Smash power", 65], ["Net play", 80], ["Endurance", 68], ["Match tactics", 70]];
const monthly = [["May", 62], ["Jun", 65], ["Jul", 67], ["Aug", 70], ["Sep", 72], ["Oct", 74]];
const goals = [["Reach rating 80", 74, 80], ["Smash power 75", 65, 75]];
export default function MyPerformance() {
  return (
    <div className="mpf">
      <section className="mpf-card"><h2>My skills</h2>
        {skills.map(([s, v]) => (<div className="mpf-skill" key={s}><span>{s}</span><div className="mpf-track"><i style={{ width: v + "%" }} /></div><b>{v}</b></div>))}
      </section>
      <section className="mpf-card"><h2>Rating over 6 months</h2>
        <div className="mpf-bars">
          {monthly.map(([m, v]) => (<div className="mpf-col" key={m}><span>{v}</span><i style={{ height: v + "%" }} /><b>{m}</b></div>))}
        </div>
      </section>
      <section className="mpf-card mpf-wide"><h2>My goals</h2>
        {goals.map(([g, now, to]) => (
          <div className="mpf-goal" key={g}><span>{g}</span><div className="mpf-track"><i style={{ width: Math.round((now / to) * 100) + "%" }} /></div><em>{now} of {to}</em></div>
        ))}
      </section>
    </div>
  );
}
