import { useState } from "react";
import { toast } from "react-toastify";
import { useStore, save, remove, uid, todayISO } from "../../db/db.js";
import { Modal, Field, Tag, Empty } from "../../Ui/Ui.jsx";

const blank = { name: "", phone: "", email: "", specialty: "", password: "", status: "Active" };

export default function OCoaches() {
  const [coaches] = useStore("coaches"), [batches] = useStore("batches"), [players] = useStore("players");
  const [form, setForm] = useState(null);
  const set = (k, v) => setForm({ ...form, [k]: v });
  const mine = (c) => batches.filter((b) => b.coachId === c.id);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    // A new coach must receive a password. On edit, a blank field keeps it unchanged.
    if (!form.id && !form.password.trim()) return toast.error("Password is required for a new coach");
    if (form.password && form.password.length < 8) return toast.error("Password must be at least 8 characters");
    const duplicateEmail = coaches.some((coach) =>
      coach.email?.toLowerCase() === form.email.trim().toLowerCase() && coach.id !== form.id
    );
    if (duplicateEmail) return toast.error("A coach with this email already exists");
    const coachToSave = {
      ...form,
      email: form.email.trim().toLowerCase(),
      password: form.password || coaches.find((coach) => coach.id === form.id)?.password || "",
      id: form.id || uid("c"),
      joined: form.joined || todayISO(),
    };
    await save("coaches", coachToSave);
    toast.success(form.id ? "Coach updated" : "Coach added");
    setForm(null);
  };
  const del = async (c) => {
    if (mine(c).length) return toast.error("Reassign this coach's batches before deleting");
    if (window.confirm(`Delete ${c.name}?`)) { await remove("coaches", c.id); toast.success("Coach deleted"); }
  };

  return (
    <div className="o-page">
      <div className="o-bar"><span className="o-lbl grow">{coaches.length} coaches</span><button className="o-btn" onClick={() => setForm(blank)}>Add coach</button></div>
      <div className="o-grid">
        {coaches.map((c) => (
          <article className="o-card" key={c.id}>
            <div className="o-rowline" style={{ border: 0, padding: 0 }}><h2>{c.name}</h2><Tag tone={c.status === "Active" ? "ok" : "warn"}>{c.status}</Tag></div>
            <p className="o-lbl">{c.specialty}</p>
            <p className="o-lbl">{c.phone} · {c.email}</p>
            <p className="o-lbl">Batches: {mine(c).map((b) => b.name).join(", ") || "None"} · {players.filter((p) => mine(c).some((b) => b.id === p.batchId)).length} players</p>
            <div className="o-actions" style={{ justifyContent: "flex-start" }}><button className="o-btn ghost sm" onClick={() => setForm(c)}>Edit</button><button className="o-btn danger sm" onClick={() => del(c)}>Delete</button></div>
          </article>
        ))}
      </div>
      {!coaches.length && <Empty text="No coaches yet." />}
      {form && (
        <Modal title={form.id ? "Edit coach" : "Add coach"} onClose={() => setForm(null)}>
          <form className="o-form" onSubmit={submit}>
            <Field label="Full name"><input value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus /></Field>
            <Field label="Specialty"><input value={form.specialty} onChange={(e) => set("specialty", e.target.value)} /></Field>
            <Field label="Phone"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="off" /></Field>
            <Field label={form.id ? "New password (leave blank to keep current)" : "Login password"}>
              <input type="password" value={form.password || ""} onChange={(e) => set("password", e.target.value)}
                placeholder={form.id ? "Leave blank to keep current password" : "Create a password (minimum 8 characters)"}
                autoComplete="new-password" minLength={8} required={!form.id} />
            </Field>
            <Field label="Status"><select value={form.status} onChange={(e) => set("status", e.target.value)}><option>Active</option><option>Inactive</option></select></Field>
            <div className="o-actions full"><button type="button" className="o-btn ghost" onClick={() => setForm(null)}>Cancel</button><button className="o-btn">Save</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
