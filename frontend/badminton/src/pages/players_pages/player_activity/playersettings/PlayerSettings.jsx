import { useState } from "react";
import "./PlayerSettings.css";
import { usePlayerData } from "../../../academy_owner/db/playerAccess.js";
import PlayerState from "../../../../cards/share/PlayerState";

function SettingsForm({ d }) {
  const { player, settings } = d;
  const [s, setS] = useState({
    name: player.name || "",
    email: player.email || "",
    phone: player.phone || player.parentPhone || "",
    ...settings,
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setSaved(false); setS({ ...s, [k]: v }); };

  const submit = async (e) => {
    e.preventDefault();
    await d.saveProfile({ name: s.name, email: s.email, phone: s.phone });
    await d.saveAlerts({ sessionReminders: s.sessionReminders, matchAlerts: s.matchAlerts, coachNotes: s.coachNotes });
    setSaved(true);
  };

  return (
    <form className="pse" onSubmit={submit}>
      <section><h2>My profile</h2>
        {[["name", "Full name"], ["email", "Email"], ["phone", "Phone"]].map(([k, l]) => (
          <label key={k} className="pse-field"><span>{l}</span><input value={s[k]} onChange={(e) => set(k, e.target.value)} /></label>
        ))}
      </section>
      <section><h2>Alerts</h2>
        {[["sessionReminders", "Session reminders"], ["matchAlerts", "Match alerts"], ["coachNotes", "New coach notes"]].map(([k, l]) => (
          <label key={k} className="pse-switch"><span>{l}</span><input type="checkbox" checked={s[k]} onChange={(e) => set(k, e.target.checked)} /></label>
        ))}
      </section>
      <button type="submit">Save changes</button>
      {saved && <p role="status" className="pse-ok">Changes saved.</p>}
    </form>
  );
}

export default function PlayerSettings() {
  const d = usePlayerData();
  if (!d.player) return <PlayerState loading={d.loading} />;
  return <SettingsForm d={d} key={d.player.id} />;
}
