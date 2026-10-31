import "./playerTournaments.css";
import { usePlayerData } from "../../../academy_owner/db/playerAccess.js";
import { fmtDate } from "../../../academy_owner/db/db.js";
import PlayerState from "../../../../cards/share/PlayerState";

const STATUS = { registration: "Registration open", ongoing: "In progress", completed: "Completed" };

export default function PlayerTournaments() {
  const d = usePlayerData();
  if (!d.player) return <PlayerState loading={d.loading} />;

  return (
    <div className="ptn">
      {d.tournaments.map((t) => (
        <article key={t.id}>
          <h2>{t.name}</h2>
          <p>{fmtDate(t.start)}{t.end && t.end !== t.start ? ` to ${fmtDate(t.end)}` : ""}</p>
          <p>{t.venue}</p>
          <p>{t.category} · {STATUS[t.status] || t.status}</p>
          {t.entered ? (
            <button className="is-joined" disabled>Entered</button>
          ) : t.status === "registration" ? (
            <button className={t.interested ? "is-joined" : ""} onClick={() => d.toggleInterest(t.id)}>
              {t.interested ? "Withdraw interest" : "Register interest"}
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
