import { useState } from "react";
import { toast } from "react-toastify";
import { useStore, save, remove, uid } from "../../db/db.js";
import { Modal, Field, Empty } from "../../Ui/Ui.jsx";

export default function OTeams() {
    const [teams] = useStore("teams"), [players] = useStore("players");
    const [form, setForm] = useState(null), [q, setQ] = useState("");
    const pn = (id) => players.find((p) => p.id === id)?.name || "Unknown";
    const toggle = (id) => setForm({ ...form, playerIds: form.playerIds.includes(id) ? form.playerIds.filter((x) => x !== id) : [...form.playerIds, id] });

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Team name is required");
        if (form.playerIds.length < 2) return toast.error("Add at least 2 players");
        await save("teams", { ...form, name: form.name.trim(), id: form.id || uid("team") });
        toast.success(form.id ? "Team updated" : "Team created");
        setForm(null);
    };
    const del = async (t) => { if (window.confirm(`Delete ${t.name}?`)) { await remove("teams", t.id); toast.success("Team deleted"); } };

    return (
        <div className="o-page">
            <div className="o-bar"><span className="o-lbl grow">{teams.length} teams</span><button className="o-btn" onClick={() => { setQ(""); setForm({ name: "", playerIds: [] }); }}>Create team</button></div>
            <div className="o-grid">
                {teams.map((t) => (
                    <article className="o-card" key={t.id}>
                        <h2>{t.name}</h2>
                        <div className="o-chips">{t.playerIds.map((id) => <span className="o-tag" key={id}>{pn(id)}</span>)}</div>
                        <div className="o-actions" style={{ justifyContent: "flex-start" }}><button className="o-btn ghost sm" onClick={() => { setQ(""); setForm(t); }}>Edit players</button><button className="o-btn danger sm" onClick={() => del(t)}>Delete</button></div>
                    </article>
                ))}
            </div>
            {!teams.length && <Empty text="No teams yet. Create one to register it in a tournament." />}
            {form && (
                <Modal title={form.id ? "Edit team" : "Create team"} onClose={() => setForm(null)}>
                    <form className="o-form" onSubmit={submit}>
                        <div className="full"><Field label="Team name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus /></Field></div>
                        <div className="full"><Field label={`Players (${form.playerIds.length} selected)`}><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players" /></Field></div>
                        <div className="o-pick full">
                            {players.filter((p) => p.status === "Active" && (p.name.toLowerCase().includes(q.toLowerCase()) || form.playerIds.includes(p.id))).map((p) => (
                                <label key={p.id}><input type="checkbox" checked={form.playerIds.includes(p.id)} onChange={() => toggle(p.id)} />{p.name}<span className="o-lbl">· age {p.age}</span></label>
                            ))}
                        </div>
                        <div className="o-actions full"><button type="button" className="o-btn ghost" onClick={() => setForm(null)}>Cancel</button><button className="o-btn">Save team</button></div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
