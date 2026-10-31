import { useState } from "react";
import "./MyMatches.css";
import { usePlayerData, shortDate, fmtTime } from "../../../academy_owner/db/playerAccess";
import PlayerState from "../../../../cards/share/PlayerState";

export default function MyMatches() {
  const d = usePlayerData();
  const [tab, setTab] = useState("Upcoming");
  if (!d.player) return <PlayerState loading={d.loading} />;

  const list = tab === "Upcoming" ? d.upcoming : d.completed;
  return (
    <div className="mmt">
      <div className="mmt-tabs">
        {["Upcoming", "Completed"].map((t) => (<button key={t} className={tab === t ? "is-on" : ""} onClick={() => setTab(t)}>{t}</button>))}
      </div>
      {list.length === 0 && <div className="mmt-row"><em>{tab === "Upcoming" ? "No upcoming matches." : "No completed matches yet."}</em></div>}
      {list.map((m) => (
        <div className="mmt-row" key={m.id}>
          <b>vs {m.opponent}</b>
          <em>
            {m.completed
              ? `${m.sets.map(([x, y]) => `${x}-${y}`).join(", ")} · ${m.tournamentName}`
              : `${shortDate(m.date)}, ${fmtTime(m.time)} · Court ${m.court} · ${m.tournamentName}`}
          </em>
          {m.completed && <span className={m.won ? "is-win" : "is-loss"}>{m.won ? "Won" : "Lost"}</span>}
        </div>
      ))}
    </div>
  );
}
