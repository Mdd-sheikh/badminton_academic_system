import { useState } from "react";
import "./PlayerSettings.css";
export default function PlayerSettings() {
  const [s, setS] = useState({ name: "Aarav Sharma", email: "", phone: "", sessionReminders: true, matchAlerts: true, coachNotes: true });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setSaved(false); setS({ ...s, [k]: v }); };
  return (
    <form className="pse" onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
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
