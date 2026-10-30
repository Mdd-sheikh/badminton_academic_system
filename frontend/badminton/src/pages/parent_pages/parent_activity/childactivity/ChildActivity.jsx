import { useState } from "react";
import "./ChildActivity.css";
const LOG = [
  { id: 1, type: "Match", text: "Won against Rohan Dey, 21-18, 21-15", date: "27 Oct" },
  { id: 2, type: "Training", text: "Doubles strategy session, 90 minutes", date: "26 Oct" },
  { id: 3, type: "Coach note", text: "Good footwork in drills, keep it up", date: "24 Oct" },
  { id: 4, type: "Tournament", text: "Registered for Kolkata Junior Open", date: "22 Oct" },
  { id: 5, type: "Training", text: "Fitness and stamina circuit", date: "20 Oct" },
];
const TABS = ["All", "Match", "Training", "Coach note", "Tournament"];
export default function ChildActivity() {
  const [tab, setTab] = useState("All");
  const list = LOG.filter((l) => tab === "All" || l.type === tab);
  return (
    <div className="pac">
      <div className="pac-tabs">
        {TABS.map((t) => (<button key={t} className={tab === t ? "is-on" : ""} onClick={() => setTab(t)}>{t}</button>))}
      </div>
      <ul className="pac-list">
        {list.map((l) => (<li key={l.id}><span className="pac-date">{l.date}</span><div><b>{l.type}</b><p>{l.text}</p></div></li>))}
        {!list.length && <li className="pac-empty">Nothing here yet.</li>}
      </ul>
    </div>
  );
}
