import { useState } from "react";
import { toast } from "react-toastify";
import { Field } from "../../Ui/Ui";

const CATS = ["Singles · Open", "Singles · Under-13", "Singles · Under-17", "Doubles · Open", "Doubles · Mixed", "Teams · Mixed"];

export default function TournamentForm({ initial, locked, onSubmit, onCancel }) {
    const [f, setF] = useState(initial);
    const set = (k, v) => setF({ ...f, [k]: v });
    const submit = (e) => {
        e.preventDefault();
        if (!f.name.trim() || !f.venue.trim()) return toast.error("Name and venue are required");
        if (!f.start || !f.end || f.end < f.start) return toast.error("End date must be on or after the start date");
        onSubmit({ ...f, name: f.name.trim(), courts: +f.courts || 4 });
    };
    return (
        <form className="o-form" onSubmit={submit}>
            <div className="full"><Field label="Tournament name"><input value={f.name} onChange={(e) => set("name", e.target.value)} autoFocus /></Field></div>
            <Field label="Start date"><input type="date" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field>
            <Field label="End date"><input type="date" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field>
            <Field label="Venue"><input value={f.venue} onChange={(e) => set("venue", e.target.value)} /></Field>
            <Field label="Courts available"><input type="number" min="1" max="16" value={f.courts} onChange={(e) => set("courts", e.target.value)} /></Field>
            <Field label="Category"><select value={f.category} onChange={(e) => set("category", e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Entrants are"><select value={f.entrantType} disabled={locked} onChange={(e) => set("entrantType", e.target.value)}><option value="singles">Individual players</option><option value="doubles">Doubles pairs</option><option value="team">Teams</option></select></Field>
            <div className="full"><Field label="Format"><select value={f.format} disabled={locked} onChange={(e) => set("format", e.target.value)}><option value="knockout">Knockout (bracket: rounds, quarterfinals, semifinals, final)</option><option value="league">Group stage / league (round robin with points table)</option></select></Field></div>
            <div className="full"><Field label="Rules"><textarea rows="3" value={f.rules} onChange={(e) => set("rules", e.target.value)} /></Field></div>
            {locked && <p className="o-lbl full">Format and entrant type are locked because fixtures exist. Reset fixtures to change them.</p>}
            <div className="o-actions full"><button type="button" className="o-btn ghost" onClick={onCancel}>Cancel</button><button className="o-btn">Save tournament</button></div>
        </form>
    );
}
