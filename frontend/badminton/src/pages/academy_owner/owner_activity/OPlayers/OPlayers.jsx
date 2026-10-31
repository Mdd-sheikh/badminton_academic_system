import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useStore, save, remove, uid, todayISO } from "../../db/db.js";
import { Modal, Field, Tag, Empty } from "../../Ui/Ui.jsx";

const blank = { name: "", age: 12, gender: "Male", batchId: "", parentName: "", parentPhone: "", status: "Active" };

export default function OPlayers() {
    const [players] = useStore("players"), [batches] = useStore("batches"), [att] = useStore("attendance");
    const [q, setQ] = useState(""), [bf, setBf] = useState("all"), [sf, setSf] = useState("all"), [form, setForm] = useState(null);
    const pct = useMemo(() => { const m = {}; att.forEach((a) => Object.entries(a.marks).forEach(([id, s]) => { const x = (m[id] ??= { t: 0, p: 0 }); x.t++; if (s !== "A") x.p++; })); return m; }, [att]);
    const rows = players.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) && (bf === "all" || p.batchId === bf) && (sf === "all" || p.status === sf)).sort((a, b) => a.name.localeCompare(b.name));
    const set = (k, v) => setForm({ ...form, [k]: v });

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Name is required");
        await save("players", { ...form, name: form.name.trim(), age: +form.age, id: form.id || uid("p"), joined: form.joined || todayISO() });
        toast.success(form.id ? "Player updated" : "Player added");
        setForm(null);
    };
    const del = async (p) => { if (window.confirm(`Delete ${p.name}?`)) { await remove("players", p.id); toast.success("Player deleted"); } };

    return (
        <div className="o-page">
            <div className="o-bar">
                <input className="grow" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players" aria-label="Search players" />
                <select value={bf} onChange={(e) => setBf(e.target.value)} aria-label="Batch"><option value="all">All batches</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                <select value={sf} onChange={(e) => setSf(e.target.value)} aria-label="Status"><option value="all">All status</option><option>Active</option><option>Inactive</option></select>
                <button className="o-btn" onClick={() => setForm({ ...blank, batchId: batches[0]?.id || "" })}>Add player</button>
            </div>
            <div className="o-wrap"><table>
                <thead><tr><th>Name</th><th>Age</th><th>Batch</th><th>Parent</th><th>Attendance</th><th>Status</th><th /></tr></thead>
                <tbody>
                    {rows.map((p) => {
                        const a = pct[p.id]; return (
                            <tr key={p.id}><td>{p.name}</td><td>{p.age}</td><td>{batches.find((b) => b.id === p.batchId)?.name || "Unassigned"}</td><td>{p.parentName} · {p.parentPhone}</td>
                                <td>{a ? Math.round((a.p / a.t) * 100) + "%" : "–"}</td><td><Tag tone={p.status === "Active" ? "ok" : "warn"}>{p.status}</Tag></td>
                                <td><button className="o-btn ghost sm" onClick={() => setForm(p)}>Edit</button><button className="o-btn danger sm" onClick={() => del(p)}>Delete</button></td></tr>);
                    })}
                </tbody>
            </table>{!rows.length && <Empty text="No players match your filters." />}</div>
            {form && (
                <Modal title={form.id ? "Edit player" : "Add player"} onClose={() => setForm(null)}>
                    <form className="o-form" onSubmit={submit}>
                        <Field label="Full name"><input value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus /></Field>
                        <Field label="Age"><input type="number" min="5" max="60" value={form.age} onChange={(e) => set("age", e.target.value)} /></Field>
                        <Field label="Gender"><select value={form.gender} onChange={(e) => set("gender", e.target.value)}><option>Male</option><option>Female</option></select></Field>
                        <Field label="Batch"><select value={form.batchId} onChange={(e) => set("batchId", e.target.value)}><option value="">Unassigned</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
                        <Field label="Parent name"><input value={form.parentName} onChange={(e) => set("parentName", e.target.value)} /></Field>
                        <Field label="Parent phone"><input value={form.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} /></Field>
                        <Field label="Status"><select value={form.status} onChange={(e) => set("status", e.target.value)}><option>Active</option><option>Inactive</option></select></Field>
                        <div className="o-actions full"><button type="button" className="o-btn ghost" onClick={() => setForm(null)}>Cancel</button><button className="o-btn">Save</button></div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
