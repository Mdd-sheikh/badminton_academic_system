import "./Achievements.css";
const A = [
  { t: "First win", d: "Won your first academy match", got: true },
  { t: "Five-day streak", d: "Attended 5 sessions in a row", got: true },
  { t: "Rising star", d: "Raised your rating by 10 points", got: true },
  { t: "Tournament debut", d: "Play in your first tournament", got: false },
  { t: "Perfect month", d: "Attend every session in a month", got: false },
];
export default function Achievements() {
  return (
    <div className="ach">
      {A.map((a) => (
        <article key={a.t} className={a.got ? "is-got" : ""}>
          <h2>{a.t}</h2><p>{a.d}</p><small>{a.got ? "Earned" : "Not yet earned"}</small>
        </article>
      ))}
    </div>
  );
}
