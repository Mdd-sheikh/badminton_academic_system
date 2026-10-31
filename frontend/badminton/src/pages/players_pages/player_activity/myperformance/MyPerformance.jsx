import "./MyPerformance.css";
import { usePlayerData } from "../../../academy_owner/db/playerAccess";
import PlayerState from "../../../../cards/share/PlayerState";

export default function MyPerformance() {
  const d = usePlayerData();
  if (!d.player) return <PlayerState loading={d.loading} />;
  if (!d.latest) return <div className="mpf"><section className="mpf-card mpf-wide"><h2>My skills</h2><p>Your coach has not added a performance review yet.</p></section></div>;

  const { skills, monthly, goals } = d;
  return (
    <div className="mpf">
      <section className="mpf-card"><h2>My skills</h2>
        {skills.map(([s, v]) => (<div className="mpf-skill" key={s}><span>{s}</span><div className="mpf-track"><i style={{ width: v + "%" }} /></div><b>{v}</b></div>))}
      </section>
      <section className="mpf-card"><h2>Rating over {monthly.length} months</h2>
        <div className="mpf-bars">
          {monthly.map(([m, v]) => (<div className="mpf-col" key={m}><span>{v}</span><i style={{ height: v + "%" }} /><b>{m}</b></div>))}
        </div>
      </section>
      <section className="mpf-card mpf-wide"><h2>My goals</h2>
        {goals.map(([g, now, to]) => (
          <div className="mpf-goal" key={g}><span>{g}</span><div className="mpf-track"><i style={{ width: Math.round((now / to) * 100) + "%" }} /></div><em>{now} of {to}</em></div>
        ))}
      </section>
    </div>
  );
}
