import "./Achievements.css";
import { usePlayerData } from "../../../academy_owner/db/playerAccess";
import PlayerState from "../../../../cards/share/PlayerState";

export default function Achievements() {
  const d = usePlayerData();
  if (!d.player) return <PlayerState loading={d.loading} />;

  return (
    <div className="ach">
      {d.achievements.map((a) => (
        <article key={a.t} className={a.got ? "is-got" : ""}>
          <h2>{a.t}</h2><p>{a.d}</p><small>{a.got ? "Earned" : "Not yet earned"}</small>
        </article>
      ))}
    </div>
  );
}
