import "./Tournaments.css";
const T = [
  { name: "Kolkata Junior Open", date: "14 Nov 2026", venue: "Salt Lake Indoor Stadium", state: "Registration open", entered: 6 },
  { name: "Under-17 State Cup", date: "5 Dec 2026", venue: "Netaji Indoor Stadium", state: "Registration open", entered: 3 },
  { name: "Club Championship", date: "20 Sep 2026", venue: "SmashPoint Arena", state: "Finished", entered: 18 },
];
export default function Tournaments() {
  return (
    <div className="tn">
      {T.map((t) => (
        <article className="tn-card" key={t.name}>
          <span className={`tn-state ${t.state === "Finished" ? "is-done" : ""}`}>{t.state}</span>
          <h2>{t.name}</h2>
          <p>{t.date}</p><p>{t.venue}</p>
          <small>{t.entered} players entered</small>
        </article>
      ))}
    </div>
  );
}
