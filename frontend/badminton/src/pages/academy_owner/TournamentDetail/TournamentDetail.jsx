import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useStore, save, saveMany, remove, removeMany, uid, fmtDate } from "../db/db.js";
import { genKnockout, genLeague, applyResult, clearResult, standings, champion, merge } from "../db/tournamentLogic.js";
import { Modal, Field, Tag, Empty } from ".././Ui/Ui.jsx";
import TournamentForm from "../owner_activity/TournamentForm/TournamentForm.jsx";

const LABEL = { registration: "Upcoming", ongoing: "Ongoing", completed: "Completed" };

export default function TournamentDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const [ts] = useStore("tournaments"), [all] = useStore("matches"), [players] = useStore("players"), [teams] = useStore("teams");
    const t = ts.find((x) => x.id === id);
    const ms = useMemo(() => all.filter((m) => m.tournamentId === id).sort((a, b) => a.round - b.round || a.idx - b.idx), [all, id]);
    const [tab, setTab] = useState("overview"), [modal, setModal] = useState(null), [roundF, setRoundF] = useState("all");

    if (!t) return <div className="o-page"><Empty text="Tournament not found." /><Link to="/owner/tournaments">Back to tournaments</Link></div>;

    const knock = t.format === "knockout";
    const name = (eid) => t.entrants.find((e) => e.id === eid)?.name;
    const side = (m, k) => (m[k] ? name(m[k]) : m.bye ? "Bye" : "TBD");
    const rounds = [...new Set(ms.map((m) => m.round))];
    const table = knock ? [] : standings(t.entrants, ms);
    const played = ms.filter((m) => m.status === "completed" && !m.bye).length, total = ms.filter((m) => !m.bye).length;
    const taken = new Set(t.entrants.flatMap((e) => e.members));

    const saveT = (patch) => save("tournaments", { ...t, ...patch });
    const finish = async (newMs) => { const ch = champion(t, t.entrants, newMs); await save("tournaments", { ...t, championId: ch, status: ch ? "completed" : "ongoing" }); if (ch) toast.success("Tournament complete. Winner declared!"); };

    const addEntrants = async (list) => { await saveT({ entrants: [...t.entrants, ...list.map((e) => ({ id: uid("e"), ...e }))] }); toast.success(`${list.length} registered`); setModal(null); };
    const removeEntrant = async (e) => { await saveT({ entrants: t.entrants.filter((x) => x.id !== e.id) }); toast.success("Entrant removed"); };
    const generate = async () => {
        if (t.entrants.length < 2) return toast.error("Register at least 2 entrants first");
        const gen = knock ? genKnockout(t, t.entrants) : genLeague(t, t.entrants);
        await saveMany("matches", gen); await saveT({ status: "ongoing", championId: null }); setTab(knock ? "bracket" : "matches");
        toast.success(`${gen.filter((m) => !m.bye).length} matches generated`);
    };
    const reset = async () => { if (!window.confirm("Delete all fixtures and results for this tournament?")) return; await removeMany("matches", ms.map((m) => m.id)); await saveT({ status: "registration", championId: null }); toast.success("Fixtures reset"); };
    const del = async () => { if (!window.confirm(`Delete ${t.name} and all its matches?`)) return; await removeMany("matches", ms.map((m) => m.id)); await remove("tournaments", t.id); nav("/owner/tournaments"); };

    const tabs = [["overview", "Overview"], ["entrants", `Entrants (${t.entrants.length})`], ["matches", "Matches"], [knock ? "bracket" : "standings", knock ? "Bracket" : "Standings"]];

    return (
        <div className="o-page">
            <div className="o-bar"><Link to="/owner/tournaments" className="o-lbl">← Tournaments</Link><span className="grow" /><Tag tone={t.status === "ongoing" ? "ok" : ""}>{LABEL[t.status]}</Tag></div>
            {t.championId && <section className="o-card o-champ"><span className="o-lbl">Tournament winner</span><h2 style={{ fontSize: 22 }}>🏆 {name(t.championId)}</h2></section>}
            <div className="o-tabs">{tabs.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</div>

            {tab === "overview" && (
                <section className="o-card">
                    <h2 style={{ fontSize: 20 }}>{t.name}</h2>
                    <p className="o-lbl">{fmtDate(t.start)} to {fmtDate(t.end)} · {t.venue} · {t.courts} courts</p>
                    <p className="o-lbl">{t.category} · {knock ? "Knockout" : "Group stage / league"} · {t.entrantType === "team" ? "Teams" : t.entrantType === "doubles" ? "Doubles pairs" : "Individual players"}</p>
                    <p style={{ margin: 0, fontSize: 14 }}>{t.rules}</p>
                    <div className="o-track"><i style={{ width: (total ? (played / total) * 100 : 0) + "%" }} /></div>
                    <span className="o-lbl">{total ? `${played} of ${total} matches played` : "Fixtures not generated yet"}</span>
                    <div className="o-actions" style={{ justifyContent: "flex-start" }}>
                        <button className="o-btn ghost" onClick={() => setModal({ type: "edit" })}>Edit details</button>
                        {!ms.length && <button className="o-btn" onClick={generate}>Generate fixtures</button>}
                        {ms.length > 0 && <button className="o-btn ghost" onClick={reset}>Reset fixtures</button>}
                        <button className="o-btn danger" onClick={del}>Delete tournament</button>
                    </div>
                </section>
            )}

            {tab === "entrants" && (
                <>
                    <div className="o-bar"><span className="o-lbl grow">{t.entrants.length} registered. {ms.length ? "Reset fixtures to change entrants." : ""}</span>
                        <button className="o-btn" disabled={!!ms.length} onClick={() => setModal({ type: "register" })}>Register {t.entrantType === "team" ? "teams" : t.entrantType === "doubles" ? "pair" : "players"}</button>
                        {!ms.length && <button className="o-btn ghost" onClick={generate} disabled={t.entrants.length < 2}>Generate fixtures</button>}</div>
                    <div className="o-wrap"><table>
                        <thead><tr><th>#</th><th>Entrant</th><th>Members</th><th /></tr></thead>
                        <tbody>{t.entrants.map((e, i) => <tr key={e.id}><td>{i + 1}</td><td>{e.name}</td><td>{e.members.map((id) => players.find((p) => p.id === id)?.name).filter(Boolean).join(", ")}</td><td><button className="o-btn danger sm" disabled={!!ms.length} onClick={() => removeEntrant(e)}>Remove</button></td></tr>)}</tbody>
                    </table>{!t.entrants.length && <Empty text="No entrants registered yet." />}</div>
                </>
            )}

            {tab === "matches" && (
                <>
                    <div className="o-bar"><select value={roundF} onChange={(e) => setRoundF(e.target.value)} aria-label="Round"><option value="all">All rounds</option>{rounds.map((r) => <option key={r} value={r}>{ms.find((m) => m.round === r).roundName}</option>)}</select></div>
                    <div className="o-wrap"><table>
                        <thead><tr><th>Round</th><th>Match</th><th>Date & court</th><th>Result</th><th /></tr></thead>
                        <tbody>{ms.filter((m) => roundF === "all" || m.round === +roundF).map((m) => (
                            <tr key={m.id}><td>{m.roundName}</td>
                                <td><span style={m.winner === m.a && m.a ? { color: "var(--c-acc)", fontWeight: 600 } : {}}>{side(m, "a")}</span> vs <span style={m.winner === m.b && m.b ? { color: "var(--c-acc)", fontWeight: 600 } : {}}>{side(m, "b")}</span></td>
                                <td>{m.bye ? "–" : `${fmtDate(m.date)} · ${m.time} · Court ${m.court}`}</td>
                                <td>{m.bye ? <Tag>Bye</Tag> : m.status === "completed" ? <b>{m.scores.map((s) => s.join("-")).join(", ")}</b> : <Tag>Scheduled</Tag>}</td>
                                <td>{!m.bye && <><button className="o-btn ghost sm" onClick={() => setModal({ type: "schedule", m })}>Schedule</button><button className="o-btn sm" disabled={!m.a || !m.b} onClick={() => setModal({ type: "score", m, sets: [0, 1, 2].map((i) => (m.scores[i] ? [...m.scores[i]] : ["", ""])) })}>{m.status === "completed" ? "Edit score" : "Enter score"}</button></>}</td></tr>
                        ))}</tbody>
                    </table>{!ms.length && <Empty text="No fixtures yet. Register entrants, then generate fixtures." />}</div>
                </>
            )}

            {tab === "bracket" && knock && (ms.length ? (
                <div className="o-bracket">{rounds.map((r) => (
                    <div className="o-round" key={r}><h3>{ms.find((m) => m.round === r).roundName}</h3>
                        {ms.filter((m) => m.round === r).map((m) => (
                            <div className="o-match" key={m.id}>
                                {["a", "b"].map((k) => <div key={k} className={`o-side ${m.winner && m.winner === m[k] ? "win" : ""} ${!m[k] ? "tbd" : ""}`}><span>{side(m, k)}</span><span>{m.scores.map((s) => s[k === "a" ? 0 : 1]).join(" ")}</span></div>)}
                            </div>))}
                    </div>))}</div>
            ) : <Empty text="Generate fixtures to see the bracket." />)}

            {tab === "standings" && !knock && (
                <div className="o-wrap"><table>
                    <thead><tr><th>#</th><th>Entrant</th><th>P</th><th>W</th><th>L</th><th>Sets</th><th>Points for/against</th><th>Pts</th></tr></thead>
                    <tbody>{table.map((r, i) => <tr key={r.id}><td>{i + 1}</td><td>{r.name}</td><td>{r.p}</td><td>{r.w}</td><td>{r.l}</td><td>{r.sf}-{r.sa}</td><td>{r.pf}-{r.pa}</td><td><b>{r.pts}</b></td></tr>)}</tbody>
                </table>{!table.length && <Empty text="No entrants yet." />}</div>
            )}

            {modal?.type === "edit" && <Modal title="Edit tournament" wide onClose={() => setModal(null)}><TournamentForm initial={t} locked={!!ms.length} onCancel={() => setModal(null)} onSubmit={async (f) => { await save("tournaments", f); toast.success("Tournament updated"); setModal(null); }} /></Modal>}
            {modal?.type === "register" && <Register t={t} players={players} teams={teams} taken={taken} onSubmit={addEntrants} onClose={() => setModal(null)} />}
            {modal?.type === "schedule" && <Schedule m={modal.m} onClose={() => setModal(null)} />}
            {modal?.type === "score" && <Score m={modal.m} sets={modal.sets} a={side(modal.m, "a")} b={side(modal.m, "b")} knock={knock} ms={ms} onDone={finish} onClose={() => setModal(null)} />}
        </div>
    );
}

function Register({ t, players, teams, taken, onSubmit, onClose }) {
    const [q, setQ] = useState(""), [sel, setSel] = useState([]), [pa, setPa] = useState(""), [pb, setPb] = useState("");
    const free = players.filter((p) => p.status === "Active" && !taken.has(p.id));
    const toggle = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
    const submit = () => {
        if (t.entrantType === "singles") { if (!sel.length) return toast.error("Select at least one player"); return onSubmit(sel.map((id) => { const p = players.find((x) => x.id === id); return { name: p.name, members: [id] }; })); }
        if (t.entrantType === "team") { if (!sel.length) return toast.error("Select at least one team"); return onSubmit(sel.map((id) => { const tm = teams.find((x) => x.id === id); return { name: tm.name, members: tm.playerIds }; })); }
        if (!pa || !pb || pa === pb) return toast.error("Choose two different players");
        onSubmit([{ name: `${players.find((p) => p.id === pa).name} / ${players.find((p) => p.id === pb).name}`, members: [pa, pb] }]);
    };
    return (
        <Modal title={t.entrantType === "team" ? "Register teams" : t.entrantType === "doubles" ? "Register a doubles pair" : "Register players"} onClose={onClose}>
            {t.entrantType === "doubles" ? (
                <div className="o-form">{[["Player 1", pa, setPa], ["Player 2", pb, setPb]].map(([l, v, s]) => <Field key={l} label={l}><select value={v} onChange={(e) => s(e.target.value)}><option value="">Select</option>{free.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>)}</div>
            ) : t.entrantType === "team" ? (
                <div className="o-pick">{teams.filter((tm) => !t.entrants.some((e) => e.name === tm.name)).map((tm) => <label key={tm.id}><input type="checkbox" checked={sel.includes(tm.id)} onChange={() => toggle(tm.id)} />{tm.name}<span className="o-lbl">· {tm.playerIds.length} players</span></label>)}</div>
            ) : (
                <><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players" aria-label="Search players" />
                    <div className="o-pick">{free.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p) => <label key={p.id}><input type="checkbox" checked={sel.includes(p.id)} onChange={() => toggle(p.id)} />{p.name}<span className="o-lbl">· age {p.age}</span></label>)}</div></>
            )}
            <div className="o-actions"><button className="o-btn ghost" onClick={onClose}>Cancel</button><button className="o-btn" onClick={submit}>Register</button></div>
        </Modal>
    );
}

function Schedule({ m, onClose }) {
    const [f, setF] = useState({ date: m.date, time: m.time, court: m.court, venue: m.venue });
    const submit = async (e) => { e.preventDefault(); await save("matches", { ...m, ...f, court: +f.court }); toast.success("Match scheduled"); onClose(); };
    return (
        <Modal title={`Schedule · ${m.roundName}`} onClose={onClose}>
            <form className="o-form" onSubmit={submit}>
                <Field label="Date"><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
                <Field label="Time"><input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
                <Field label="Court"><input type="number" min="1" max="16" value={f.court} onChange={(e) => setF({ ...f, court: e.target.value })} /></Field>
                <Field label="Venue"><input value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} /></Field>
                <div className="o-actions full"><button type="button" className="o-btn ghost" onClick={onClose}>Cancel</button><button className="o-btn">Save</button></div>
            </form>
        </Modal>
    );
}

function Score({ m, sets: init, a, b, knock, ms, onDone, onClose }) {
    const [sets, setSets] = useState(init);
    const set = (i, j, v) => setSets(sets.map((s, x) => (x === i ? s.map((n, y) => (y === j ? v : n)) : s)));
    const commit = async (res) => {
        if (res.error) return toast.error(res.error);
        await saveMany("matches", res.changed); await onDone(merge(ms, res.changed)); onClose();
    };
    return (
        <Modal title={`${m.roundName}: enter score`} onClose={onClose}>
            <p className="o-lbl" style={{ margin: 0 }}>Best of 3 sets. Leave set 3 empty if the match ended 2-0.</p>
            <div className="o-wrap"><table>
                <thead><tr><th /><th>{a}</th><th>{b}</th></tr></thead>
                <tbody>{sets.map((s, i) => <tr key={i}><td>Set {i + 1}</td>{[0, 1].map((j) => <td key={j}><input type="number" min="0" max="30" style={{ width: 70 }} value={s[j]} onChange={(e) => set(i, j, e.target.value)} aria-label={`Set ${i + 1} ${j ? b : a}`} /></td>)}</tr>)}</tbody>
            </table></div>
            <div className="o-actions">
                {m.status === "completed" && <button className="o-btn danger" onClick={() => commit(clearResult(ms, m.id, knock))}>Clear result</button>}
                <button className="o-btn ghost" onClick={onClose}>Cancel</button>
                <button className="o-btn" onClick={() => commit(applyResult(ms, m.id, sets, knock))}>Save result</button>
            </div>
        </Modal>
    );
}
