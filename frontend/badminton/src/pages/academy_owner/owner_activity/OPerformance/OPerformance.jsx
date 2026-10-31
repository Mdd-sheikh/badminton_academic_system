import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useStore, save, todayISO, METRICS, avgOf } from "../../db/db.js";
import { Empty, Tag } from "../../Ui/Ui.jsx";

export default function OPerformance() {
  const [players] = useStore("players"), [perf] = useStore("performance"), [batches] = useStore("batches");
  const [bf, setBf] = useState("all"), [pid, setPid] = useState(""), [month, setMonth] = useState(todayISO().slice(0, 7));
  const list = players.filter((p) => p.status === "Active" && (bf === "all" || p.batchId === bf)).sort((a, b) => a.name.localeCompare(b.name));
  const sel = list.find((p) => p.id === pid) || list[0];
  const rec = sel && perf.find((p) => p.id === `${sel.id}|${month}`);
  const [vals, setVals] = useState({}), [note, setNote] = useState("");
  useEffect(() => { setVals(rec ? { ...rec.metrics } : Object.fromEntries(METRICS.map(([k]) => [k, 50]))); setNote(rec?.note || ""); }, [sel?.id, month, rec?.updatedAt]); // eslint-disable-line

  const history = useMemo(() => (sel ? perf.filter((p) => p.playerId === sel.id).sort((a, b) => a.month.localeCompare(b.month)) : []), [perf, sel]);
  const prev = history.filter((h) => h.month < month).pop();
  const board = list.map((p) => ({ p, r: perf.find((x) => x.id === `${p.id}|${month}`) })).filter((x) => x.r).map((x) => ({ ...x, avg: avgOf(x.r.metrics) })).sort((a, b) => b.avg - a.avg).slice(0, 8);

  const submit = async () => {
    if (!sel) return;
    await save("performance", { id: `${sel.id}|${month}`, playerId: sel.id, month, metrics: vals, note, by: "Owner", overridden: !!rec && !rec.by.startsWith("Owner"), updatedAt: new Date().toISOString() });
    toast.success(rec ? "Evaluation updated" : "Evaluation saved");
  };

  return (
    <div className="o-page">
      <div className="o-bar">
        <select value={bf} onChange={(e) => { setBf(e.target.value); setPid(""); }} aria-label="Batch"><option value="all">All batches</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select value={sel?.id || ""} onChange={(e) => setPid(e.target.value)} aria-label="Player">{list.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <input type="month" value={month} max={todayISO().slice(0, 7)} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Month" />
      </div>
      {!sel ? <Empty text="No players in this batch." /> : (
        <div className="o-cols">
          <section className="o-card">
            <div className="o-rowline" style={{ border: 0, padding: 0 }}><h2>{sel.name}</h2>{rec ? <Tag>Last by {rec.by}</Tag> : <Tag tone="warn">Not evaluated</Tag>}</div>
            {METRICS.map(([k, label]) => (
              <div className="o-metric" key={k}>
                <div><span>{label}</span><b>{vals[k] ?? 0}{prev && <small className="o-lbl"> ({vals[k] - prev.metrics[k] >= 0 ? "+" : ""}{(vals[k] ?? 0) - prev.metrics[k]})</small>}</b></div>
                <input type="range" min="0" max="100" value={vals[k] ?? 0} onChange={(e) => setVals({ ...vals, [k]: +e.target.value })} aria-label={label} />
              </div>
            ))}
            <textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Coach / owner note" aria-label="Note" />
            <div className="o-actions"><span className="o-lbl grow">Overall: <b>{avgOf(vals)}</b></span><button className="o-btn" onClick={submit}>{rec ? "Save override" : "Save evaluation"}</button></div>
          </section>
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <section className="o-card"><h2>Progress</h2>
              {history.length ? <div className="o-bars">{history.map((h) => <div key={h.id}><span>{avgOf(h.metrics)}</span><i style={{ height: avgOf(h.metrics) + "%" }} /><span>{h.month.slice(2)}</span></div>)}</div> : <Empty text="No history yet." />}
            </section>
            <section className="o-card"><h2>Leaderboard, {month}</h2>
              {board.length ? board.map(({ p, avg }, i) => <div className="o-rowline" key={p.id}><span>{i + 1}. {p.name}</span><b>{avg}</b></div>) : <Empty text="No evaluations for this month." />}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
