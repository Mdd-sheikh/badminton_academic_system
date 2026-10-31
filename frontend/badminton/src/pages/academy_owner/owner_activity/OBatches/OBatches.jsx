import { useState } from "react";
import { toast } from "react-toastify";
import { useStore, save, remove, uid, DOW } from "../../db/db.js";
import { Modal, Field, Empty } from "../../Ui/Ui";

const blank = { name: "", level: "Beginner", days: ["Mon", "Wed", "Fri"], time: "17:00", court: 1, capacity: 12, coachId: "" };

export default function OBatches() {
  const [batches] = useStore("batches"), [coaches] = useStore("coaches"), [players] = useStore("players");
  const [form, setForm] = useState(null), [roster, setRoster] = useState(null), [q, setQ] = useState("");
  const set = (k, v) => setForm({ ...form, [k]: v });
  const count = (b) => players.filter((p) => p.batchId === b.id && p.status === "Active").length;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Batch name is required");
    if (!form.days.length) return toast.error("Pick at least one training day");
    await save("batches", { ...form, name: form.name.trim(), capacity: +form.capacity, court: +form.court, id: form.id || uid("b") });
    toast.success(form.id ? "Batch updated" : "Batch created");
    setForm(null);
  };
  const del = async (b) => {
    if (count(b)) return toast.error("Move this batch's players before deleting");
    if (window.confirm(`Delete ${b.name}?`)) { await remove("batches", b.id); toast.success("Batch deleted"); }
  };
  const assign = async (p, b) => save("players", { ...p, batchId: p.batchId === b.id ? "" : b.id });
  const rb = roster && batches.find((b) => b.id === roster);

  return (
    <div className="o-page">
      <div className="o-bar"><span className="o-lbl grow">{batches.length} batches</span><button className="o-btn" onClick={() => setForm({ ...blank, coachId: coaches[0]?.id || "" })}>Create batch</button></div>
      <div className="o-grid">
        {batches.map((b) => (
          <article className="o-card" key={b.id}>
            <h2>{b.name}</h2>
            <p className="o-lbl">{b.level} · {b.days.join(", ")} · {b.time} · Court {b.court}</p>
            <p className="o-lbl">Coach: {coaches.find((c) => c.id === b.coachId)?.name || "Unassigned"}</p>
            <div className="o-track"><i style={{ width: Math.min(100, (count(b) / b.capacity) * 100) + "%" }} /></div>
            <span className="o-lbl">{count(b)} of {b.capacity} places filled</span>
            <div className="o-actions" style={{ justifyContent: "flex-start" }}>
              <button className="o-btn ghost sm" onClick={() => { setQ(""); setRoster(b.id); }}>Players</button>
              <button className="o-btn ghost sm" onClick={() => setForm(b)}>Edit</button>
              <button className="o-btn danger sm" onClick={() => del(b)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
      {!batches.length && <Empty text="No batches yet." />}
      {form && (
        <Modal title={form.id ? "Edit batch" : "Create batch"} onClose={() => setForm(null)}>
          <form className="o-form" onSubmit={submit}>
            <Field label="Batch name"><input value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus /></Field>
            <Field label="Level"><select value={form.level} onChange={(e) => set("level", e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
            <Field label="Coach"><select value={form.coachId} onChange={(e) => set("coachId", e.target.value)}><option value="">Unassigned</option>{coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="Start time"><input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} /></Field>
            <Field label="Court"><input type="number" min="1" max="12" value={form.court} onChange={(e) => set("court", e.target.value)} /></Field>
            <Field label="Capacity"><input type="number" min="1" max="40" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} /></Field>
            <div className="full"><Field label="Training days"><div className="o-chips">{DOW.map((d) => <button type="button" key={d} className={`o-chip ${form.days.includes(d) ? "on" : ""}`} onClick={() => set("days", form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d])}>{d}</button>)}</div></Field></div>
            <div className="o-actions full"><button type="button" className="o-btn ghost" onClick={() => setForm(null)}>Cancel</button><button className="o-btn">Save</button></div>
          </form>
        </Modal>
      )}
      {rb && (
        <Modal title={`${rb.name}: players`} onClose={() => setRoster(null)}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players" aria-label="Search players" />
          <div className="o-pick">
            {players.filter((p) => p.status === "Active" && (p.batchId === rb.id || p.name.toLowerCase().includes(q.toLowerCase()))).map((p) => (
              <label key={p.id}><input type="checkbox" checked={p.batchId === rb.id} onChange={() => assign(p, rb)} />{p.name}<span className="o-lbl">· {batches.find((b) => b.id === p.batchId && b.id !== rb.id)?.name || ""}</span></label>
            ))}
          </div>
          <p className="o-lbl">Changes save instantly. Ticking a player here moves them out of their previous batch.</p>
        </Modal>
      )}
    </div>
  );
}
