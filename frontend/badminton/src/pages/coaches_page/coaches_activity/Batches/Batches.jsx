import "./Batches.css";
const BATCHES = [
  { name: "Junior", time: "Mon, Wed, Fri · 6:00 AM", players: 14, cap: 16 },
  { name: "Senior", time: "Tue, Thu, Sat · 4:30 PM", players: 12, cap: 14 },
  { name: "Elite", time: "Daily · 6:30 PM", players: 8, cap: 10 },
  { name: "Weekend", time: "Sat, Sun · 8:00 AM", players: 9, cap: 20 },
];
export default function Batches() {
  return (
    <div className="bt">
      <div className="bt-head"><p>{BATCHES.length} batches</p><button>New batch</button></div>
      <div className="bt-grid">
        {BATCHES.map((b) => {
          const pct = Math.round((b.players / b.cap) * 100);
          return (
            <article className="bt-card" key={b.name}>
              <h2>{b.name}</h2>
              <p>{b.time}</p>
              <div className="bt-track" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"><i style={{ width: pct + "%" }} /></div>
              <span>{b.players} of {b.cap} places filled</span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
