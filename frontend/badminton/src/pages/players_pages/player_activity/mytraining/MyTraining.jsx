import "./MyTraining.css";
import { usePlayerData } from "../../../academy_owner/db/playerAccess";
import PlayerState from "../../../../cards/share/PlayerState";

export default function MyTraining() {
  const d = usePlayerData();
  if (!d.player) return <PlayerState loading={d.loading} />;

  const { training, drillsDone, toggleDrill } = d;
  const today = training.filter((p) => p.day === "Today");
  const count = today.filter((p) => drillsDone[p.key]).length;
  const days = [...new Set(training.map((p) => p.day))];

  return (
    <div className="mtr">
      <p className="mtr-sum">{count} of {today.length} drills done today</p>
      {days.map((day) => (
        <section className="mtr-card" key={day}><h2>{day}</h2>
          {training.filter((p) => p.day === day).map((p) => (
            <label key={p.key} className={drillsDone[p.key] ? "is-done" : ""}>
              <input type="checkbox" checked={!!drillsDone[p.key]} onChange={() => toggleDrill(p.key)} />
              <div><b>{p.name}</b><span>{p.detail}</span></div>
            </label>
          ))}
        </section>
      ))}
    </div>
  );
}
