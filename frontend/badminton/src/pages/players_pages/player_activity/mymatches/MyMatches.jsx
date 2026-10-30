import { useState } from "react";
import "./MyMatches.css";
const M = [
  { id: 1, vs: "Rohan Dey", info: "21-18, 21-15", state: "Completed", won: true },
  { id: 2, vs: "Vik Sharma", info: "17-21, 21-19, 16-21", state: "Completed", won: false },
  { id: 3, vs: "Sana Khan", info: "Saturday, 10:00 AM", state: "Upcoming" },
  { id: 4, vs: "Dev Nair", info: "Sunday, 11:30 AM", state: "Upcoming" },
];
export default function MyMatches() {
  const [tab, setTab] = useState("Upcoming");
  return (
    <div className="mmt">
      <div className="mmt-tabs">
        {["Upcoming", "Completed"].map((t) => (<button key={t} className={tab === t ? "is-on" : ""} onClick={() => setTab(t)}>{t}</button>))}
      </div>
      {M.filter((m) => m.state === tab).map((m) => (
        <div className="mmt-row" key={m.id}>
          <b>vs {m.vs}</b><em>{m.info}</em>
          {m.state === "Completed" && <span className={m.won ? "is-win" : "is-loss"}>{m.won ? "Won" : "Lost"}</span>}
        </div>
      ))}
    </div>
  );
}
