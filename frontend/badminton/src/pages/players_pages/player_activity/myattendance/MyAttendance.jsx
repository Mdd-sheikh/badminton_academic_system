import "./MyAttendance.css";
import { usePlayerData, shortDate } from "../../../academy_owner/db/playerAccess";
import PlayerState from "../../../../cards/share/PlayerState";

export default function MyAttendance() {
  const d = usePlayerData();
  if (!d.player) return <PlayerState loading={d.loading} />;

  const { attendance, stats } = d;
  const recent = attendance.slice(0, 10);
  const word = { P: "Present", L: "Late", A: "Absent" };

  return (
    <div className="mat">
      <section className="mat-card"><span className="mat-num">{stats.total ? `${stats.pct}%` : "-"}</span>
        <p>{stats.total ? `You attended ${stats.attended} of ${stats.total} sessions` : "No sessions recorded yet"}</p>
        <div className="mat-track"><i style={{ width: stats.pct + "%" }} /></div>
      </section>
      <ul className="mat-card mat-list">
        {recent.map((s) => (<li key={s.id}><span>{shortDate(s.date)}</span><b className={s.status === "A" ? "is-out" : "is-in"}>{word[s.status] || s.status}</b></li>))}
      </ul>
    </div>
  );
}
