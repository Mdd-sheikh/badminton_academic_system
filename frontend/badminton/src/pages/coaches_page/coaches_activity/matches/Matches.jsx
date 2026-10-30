import { useState } from "react";
import "./Matches.css";
const MATCHES = [
  { id: 1, a: "Riya Sen", b: "Anaya Bose", score: "21-17, 21-19", state: "Completed" },
  { id: 2, a: "Arjun Das", b: "Rohan Dey", score: "18-21, 21-15, 17-21", state: "Completed" },
  { id: 3, a: "Meera Paul", b: "Sana Khan", score: "Sat 10:00 AM", state: "Upcoming" },
  { id: 4, a: "Kabir Roy", b: "Vik Sharma", score: "Sun 11:30 AM", state: "Upcoming" },
];
export default function Matches() {
  const [tab, setTab] = useState("Upcoming");
  return (
    <div className="mt">
      <div className="mt-tabs" role="tablist">
        {["Upcoming", "Completed"].map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "is-on" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {MATCHES.filter((m) => m.state === tab).map((m) => (
        <div className="mt-row" key={m.id}>
          <b>{m.a}</b><span>vs</span><b>{m.b}</b><em>{m.score}</em>
        </div>
      ))}
    </div>
  );
}
