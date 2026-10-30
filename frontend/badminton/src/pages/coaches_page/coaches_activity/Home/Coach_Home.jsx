import "./Coach_Home.css";
const stats = [["Active players", 48], ["Batches", 6], ["Today's sessions", 3], ["Avg attendance", "86%"]];
const today = [["6:00 AM", "Junior batch", "Footwork drills"], ["4:30 PM", "Senior batch", "Doubles strategy"], ["6:30 PM", "Elite batch", "Match simulation"]];
const recent = ["Riya Sen moved to Elite batch", "Under-17 Open registration closed", "Attendance saved for Junior batch"];
export default function Coach_Home() {
  return (
    <div className="home">
      <div className="home-stats">
        {stats.map(([l, v]) => (<div className="home-card" key={l}><span className="home-num">{v}</span><span className="home-lbl">{l}</span></div>))}
      </div>
      <div className="home-cols">
        <section className="home-card"><h2>Today</h2>
          {today.map(([t, b, n]) => (<div className="home-row" key={t}><b>{t}</b><span>{b}</span><em>{n}</em></div>))}
        </section>
        <section className="home-card"><h2>Recent activity</h2>
          <ul>{recent.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}
