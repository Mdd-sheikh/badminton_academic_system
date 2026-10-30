import { useState } from "react";
import "./MyTraining.css";
const PLAN = [
  { id: 1, name: "Footwork ladder", detail: "10 minutes, 3 rounds", day: "Today" },
  { id: 2, name: "Smash practice", detail: "30 shots each side", day: "Today" },
  { id: 3, name: "Shadow swings", detail: "5 minutes", day: "Today" },
  { id: 4, name: "Stamina run", detail: "20 minutes easy pace", day: "Saturday" },
  { id: 5, name: "Net drops", detail: "50 reps", day: "Saturday" },
];
export default function MyTraining() {
  const [done, setDone] = useState({});
  const today = PLAN.filter((p) => p.day === "Today");
  const count = today.filter((p) => done[p.id]).length;
  return (
    <div className="mtr">
      <p className="mtr-sum">{count} of {today.length} drills done today</p>
      {["Today", "Saturday"].map((d) => (
        <section className="mtr-card" key={d}><h2>{d}</h2>
          {PLAN.filter((p) => p.day === d).map((p) => (
            <label key={p.id} className={done[p.id] ? "is-done" : ""}>
              <input type="checkbox" checked={!!done[p.id]} onChange={() => setDone({ ...done, [p.id]: !done[p.id] })} />
              <div><b>{p.name}</b><span>{p.detail}</span></div>
            </label>
          ))}
        </section>
      ))}
    </div>
  );
}
