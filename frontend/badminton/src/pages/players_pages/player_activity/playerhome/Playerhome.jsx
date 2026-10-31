import "./PlayerHome.css";
import { usePlayerData, dayLabel, fmtTime } from "../../../academy_owner/db/playerAccess";
import PlayerState from "../../../../cards/share/PlayerState";

export default function PlayerHome() {
  const d = usePlayerData();
  if (!d.player) return <PlayerState loading={d.loading} />;

  const { player, coach, batch, stats, rating, nextSession, training, latest } = d;
  const stat = [
    ["Overall rating", rating ?? "-"],
    ["Attendance", stats.total ? `${stats.pct}%` : "-"],
    ["Wins", `${stats.wins} of ${stats.played}`],
    ["Session streak", stats.streak],
  ];

  const label = nextSession ? dayLabel(nextSession.date) : "";
  const when = ["Today", "Tomorrow"].includes(label) ? label.toLowerCase() : label;
  const todays = training.filter((x) => x.day === "Today");
  const coachLast = coach ? coach.name.trim().split(/\s+/).pop() : "";

  return (
    <div className="plh">
      <section className="plh-card plh-hero">
        <h2>Welcome back, {player.name.split(" ")[0]}</h2>
        <p>
          {nextSession
            ? `Next up: ${batch.name} training, ${when} at ${fmtTime(nextSession.time)} on Court ${nextSession.court}.`
            : "No upcoming sessions are scheduled yet."}
        </p>
      </section>
      <div className="plh-stats">
        {stat.map(([l, v]) => (<div className="plh-card" key={l}><span className="plh-num">{v}</span><span className="plh-lbl">{l}</span></div>))}
      </div>
      <div className="plh-cols">
        <section className="plh-card"><h2>Today's drills</h2>
          <ul>{todays.map((x) => <li key={x.key}>{x.name}, {x.detail}</li>)}</ul>
        </section>
        <section className="plh-card"><h2>{coachLast ? `Note from Coach ${coachLast}` : "Note from your coach"}</h2>
          <p className="plh-lbl">{latest?.note || "No notes from your coach yet."}</p>
        </section>
      </div>
    </div>
  );
}
