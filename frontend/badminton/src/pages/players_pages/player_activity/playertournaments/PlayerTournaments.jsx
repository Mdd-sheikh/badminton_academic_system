import { useState } from "react";
import "./playerTournaments.css";
export default function PlayerTournaments() {
  const [list, setList] = useState([
    { name: "Kolkata Junior Open", date: "14 Nov 2026", venue: "Salt Lake Indoor Stadium", joined: true },
    { name: "Under-17 State Cup", date: "5 Dec 2026", venue: "Netaji Indoor Stadium", joined: false },
    { name: "Club Championship", date: "20 Jan 2027", venue: "SmashPoint Arena", joined: false },
  ]);
  const toggle = (n) => setList(list.map((t) => (t.name === n ? { ...t, joined: !t.joined } : t)));
  return (
    <div className="ptn">
      {list.map((t) => (
        <article key={t.name}>
          <h2>{t.name}</h2><p>{t.date}</p><p>{t.venue}</p>
          <button className={t.joined ? "is-joined" : ""} onClick={() => toggle(t.name)}>{t.joined ? "Withdraw" : "Register interest"}</button>
        </article>
      ))}
    </div>
  );
}
