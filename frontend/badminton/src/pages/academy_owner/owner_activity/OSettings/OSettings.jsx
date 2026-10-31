import { useState } from "react";
import { toast } from "react-toastify";
import { useStore } from "../../db/db.js";
import { resetDemo } from "../../db/seed.js";

export default function OSettings() {
  const [players] = useStore("players"), [att] = useStore("attendance"), [perf] = useStore("performance"), [ms] = useStore("matches"), [ts] = useStore("tournaments");
  const [busy, setBusy] = useState(false);
  const reset = async () => {
    if (!window.confirm("Reset all data back to the demo dataset? Your changes will be lost.")) return;
    setBusy(true); await resetDemo(); setBusy(false); toast.success("Demo data restored");
  };
  return (
    <div className="o-page" style={{ maxWidth: 560 }}>
      <section className="o-card"><h2>Browser database</h2>
        <p className="o-lbl">All data is stored in this browser using IndexedDB. There is no server.</p>
        {[["Players", players.length], ["Attendance sessions", att.length], ["Performance evaluations", perf.length], ["Tournaments", ts.length], ["Matches", ms.length]].map(([l, v]) => <div className="o-rowline" key={l}><span>{l}</span><b>{v}</b></div>)}
        <div className="o-actions"><button className="o-btn danger" disabled={busy} onClick={reset}>{busy ? "Resetting…" : "Reset to demo data"}</button></div>
      </section>
    </div>
  );
}
