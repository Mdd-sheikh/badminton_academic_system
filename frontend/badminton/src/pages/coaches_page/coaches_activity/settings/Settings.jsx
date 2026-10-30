import { useState } from "react";
import "./Settings.css";
export default function Settings() {
  const [s, setS] = useState({ name: "Coach Nandi", email: "nandi@smashpoint.in", phone: "", matchAlerts: true, attendanceAlerts: true, weeklyEmail: false });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setSaved(false); setS({ ...s, [k]: v }); };
  return (
    <form className="st" onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
      <section>
        <h2>Profile</h2>
        {[["name", "Full name"], ["email", "Email"], ["phone", "Phone"]].map(([k, l]) => (
          <label key={k} className="st-field"><span>{l}</span><input value={s[k]} onChange={(e) => set(k, e.target.value)} /></label>
        ))}
      </section>
      <section>
        <h2>Notifications</h2>
        {[["matchAlerts", "Match reminders"], ["attendanceAlerts", "Low attendance alerts"], ["weeklyEmail", "Weekly summary email"]].map(([k, l]) => (
          <label key={k} className="st-switch"><span>{l}</span><input type="checkbox" checked={s[k]} onChange={(e) => set(k, e.target.checked)} /></label>
        ))}
      </section>
      <button type="submit">Save changes</button>
      {saved && <p role="status" className="st-ok">Changes saved.</p>}
    </form>
  );
}
