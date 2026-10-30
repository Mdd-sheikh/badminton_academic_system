import "./PlayerHome.css";
const stats = [["Overall rating", 74], ["Attendance", "88%"], ["Wins", "7 of 11"], ["Day streak", 5]];
export default function PlayerHome() {
  return (
    <div className="plh">
      <section className="plh-card plh-hero">
        <h2>Welcome back, Aarav</h2>
        <p>Next up: Doubles strategy, tomorrow at 4:30 PM on Court 1.</p>
      </section>
      <div className="plh-stats">
        {stats.map(([l, v]) => (<div className="plh-card" key={l}><span className="plh-num">{v}</span><span className="plh-lbl">{l}</span></div>))}
      </div>
      <div className="plh-cols">
        <section className="plh-card"><h2>Today's drills</h2>
          <ul><li>Footwork ladder, 10 minutes</li><li>Smash practice, 30 shots</li><li>Cool-down stretching</li></ul>
        </section>
        <section className="plh-card"><h2>Note from Coach Nandi</h2>
          <p className="plh-lbl">Your net play is getting sharper. Keep your racket up on the return and recover to the centre faster.</p>
        </section>
      </div>
    </div>
  );
}
