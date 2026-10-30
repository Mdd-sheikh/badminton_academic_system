import "./ParentHome.css";
const stats = [["Attendance", "88%"], ["Matches won", "7 of 11"], ["Overall rating", "74"], ["Sessions this month", 14]];
export default function ParentHome() {
  return (
    <div className="pho">
      <section className="pho-card pho-child">
        <span className="pho-av">AS</span>
        <div><h2>Aarav Sharma</h2><p>Senior batch · Coach Nandi · Age 14</p></div>
      </section>
      <div className="pho-stats">
        {stats.map(([l, v]) => (<div className="pho-card" key={l}><span className="pho-num">{v}</span><span className="pho-lbl">{l}</span></div>))}
      </div>
      <div className="pho-cols">
        <section className="pho-card"><h2>Next session</h2>
          <p className="pho-big">Tomorrow, 4:30 PM</p><p className="pho-lbl">Doubles strategy · Court 1</p>
        </section>
        <section className="pho-card"><h2>Latest note from coach</h2>
          <p className="pho-lbl">Aarav's net play has improved a lot this month. Next we will work on smash accuracy and stamina in long rallies.</p>
        </section>
      </div>
    </div>
  );
}
