import "./MySchedule.css";
import { usePlayerData, dayLabel, fmtTime } from "../../../academy_owner/db/playerAccess";
import PlayerState from "../../../../cards/share/PlayerState";

export default function MySchedule() {
  const d = usePlayerData();
  if (!d.player) return <PlayerState loading={d.loading} />;

  const { batch, coach, sessions, upcoming } = d;
  const rows = [
    ...sessions.map((s) => ({ key: `s-${s.date}`, date: s.date, time: s.time, name: `${batch.name} training`, venue: `Court ${s.court}${coach ? ` · ${coach.name}` : ""}` })),
    ...upcoming.map((m) => ({ key: `m-${m.id}`, date: m.date, time: m.time, name: `${m.tournamentName}, ${m.roundName} vs ${m.opponent}`, venue: m.venue })),
  ].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 10);

  return (
    <div className="msc">
      {rows.length === 0 && <div className="msc-row"><p>Nothing is scheduled yet.</p></div>}
      {rows.map((r) => (
        <div className="msc-row" key={r.key}><b>{dayLabel(r.date)}</b><span>{fmtTime(r.time)}</span><div><p>{r.name}</p><em>{r.venue}</em></div></div>
      ))}
    </div>
  );
}
