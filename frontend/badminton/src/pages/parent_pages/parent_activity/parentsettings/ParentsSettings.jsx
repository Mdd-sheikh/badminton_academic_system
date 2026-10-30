import { useState } from "react";
import "./ParentSettings.css";
export default function ParentSettings() {
  const [s, setS] = useState({ name: "Mr. Sharma", email: "", phone: "", matchResults: true, attendanceAlerts: true, monthlyReport: true });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setSaved(false); setS({ ...s, [k]: v }); };
  return (
    <form className="pst" onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
      <section>
        <h2>Your details</h2>
        {[["name", "Full name"], ["email", "Email"], ["phone", "Phone"]].map(([k, l]) => (
          <label key={k} className="pst-field"><span>{l}</span><input value={s[k]} onChange={(e) => set(k, e.target.value)} /></label>
        ))}
      </section>
      <section>
        <h2>Alerts</h2>
        {[["matchResults", "Match results"], ["attendanceAlerts", "Missed session alerts"], ["monthlyReport", "Monthly progress report"]].map(([k, l]) => (
          <label key={k} className="pst-switch"><span>{l}</span><input type="checkbox" checked={s[k]} onChange={(e) => set(k, e.target.checked)} /></label>
        ))}
      </section>
      <button type="submit">Save changes</button>
      {saved && <p role="status" className="pst-ok">Changes saved.</p>}
    </form>
  );
}
