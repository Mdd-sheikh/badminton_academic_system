import "./Performance.css";
const skills = [["Footwork", 72, "+4"], ["Smash power", 65, "+2"], ["Net play", 80, "+8"], ["Endurance", 68, "0"], ["Match tactics", 70, "+3"]];
const monthly = [["May", 62], ["Jun", 65], ["Jul", 67], ["Aug", 70], ["Sep", 72], ["Oct", 74]];
export default function Performance() {
  return (
    <div className="pfm">
      <section className="pfm-card">
        <h2>Skill ratings</h2>
        {skills.map(([s, v, d]) => (
          <div className="pfm-skill" key={s}>
            <span>{s}</span><div className="pfm-track"><i style={{ width: v + "%" }} /></div><b>{v}</b>
            <em>{d === "0" ? "No change" : d + " this month"}</em>
          </div>
        ))}
      </section>
      <section className="pfm-card">
        <h2>Overall rating, last 6 months</h2>
        <div className="pfm-bars">
          {monthly.map(([m, v]) => (<div className="pfm-col" key={m}><span>{v}</span><i style={{ height: v + "%" }} /><b>{m}</b></div>))}
        </div>
      </section>
      <section className="pfm-card pfm-wide">
        <h2>Coach feedback</h2>
        <p>Strong improvement in net play and match tactics. Focus for November: smash accuracy and keeping energy up in the third game.</p>
      </section>
    </div>
  );
}
