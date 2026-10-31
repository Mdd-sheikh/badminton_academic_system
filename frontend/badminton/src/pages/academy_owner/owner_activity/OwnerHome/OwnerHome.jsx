import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStore, todayISO, addDays, fmtDate, avgOf } from "../../db/db.js";
import { Stat, Empty, Tag } from "../../Ui/Ui.jsx";

export default function OwnerHome() {
  const [players] = useStore("players"), [coaches] = useStore("coaches"), [batches] = useStore("batches");
  const [att] = useStore("attendance"), [perf] = useStore("performance"), [ts] = useStore("tournaments"), [ms] = useStore("matches");
  const today = todayISO();

  const pctOn = (from, to) => { let p = 0, t = 0; att.filter((a) => a.date >= from && a.date <= to).forEach((a) => Object.values(a.marks).forEach((s) => { t++; if (s !== "A") p++; })); return t ? Math.round((p / t) * 100) : null; };
  const trend = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = addDays(today, i - 13); return { d, v: pctOn(d, d) }; }), [att]); // eslint-disable-line
  const avg30 = pctOn(addDays(today, -30), today);

  const month = perf.reduce((m, p) => (p.month > m ? p.month : m), "");
  const top = perf.filter((p) => p.month === month).map((p) => ({ p, avg: avgOf(p.metrics) })).sort((a, b) => b.avg - a.avg).slice(0, 5);
  const pname = (id) => players.find((p) => p.id === id)?.name || "Player";

  const upcoming = ms.filter((m) => m.status === "scheduled" && m.a && m.b && m.date >= today && ts.find((t) => t.id === m.tournamentId)?.status === "ongoing").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 5);
  const nm = (m, k) => ts.find((t) => t.id === m.tournamentId)?.entrants.find((e) => e.id === m[k])?.name;

  return (
    <div className="o-page">
      <div className="o-stats">
        <Stat label="Active players" value={players.filter((p) => p.status === "Active").length} />
        <Stat label="Coaches" value={coaches.length} />
        <Stat label="Batches" value={batches.length} />
        <Stat label="Attendance, last 30 days" value={avg30 == null ? "–" : avg30 + "%"} />
        <Stat label="Ongoing tournaments" value={ts.filter((t) => t.status === "ongoing").length} />
      </div>
      <div className="o-cols">
        <section className="o-card"><h2>Attendance, last 14 days (%)</h2>
          <div className="o-bars">{trend.map((x) => (<div key={x.d} title={fmtDate(x.d)}><span>{x.v ?? ""}</span><i style={{ height: (x.v ?? 0) + "%" }} /><span>{x.d.slice(8)}</span></div>))}</div>
        </section>
        <section className="o-card"><h2>Top performers, {month}</h2>
          {top.length ? top.map(({ p, avg }) => (<div className="o-rowline" key={p.id}><span>{pname(p.playerId)}</span><b>{avg}</b></div>)) : <Empty text="No evaluations yet." />}
          <Link to="/owner/performance" className="o-lbl">Open performance →</Link>
        </section>
      </div>
      <div className="o-cols">
        <section className="o-card"><h2>Upcoming matches</h2>
          {upcoming.length ? upcoming.map((m) => (<div className="o-rowline" key={m.id}><span>{nm(m, "a")} vs {nm(m, "b")}</span><span className="o-lbl">{fmtDate(m.date)} · {m.time} · Court {m.court}</span></div>)) : <Empty text="No scheduled matches." />}
        </section>
        <section className="o-card"><h2>Tournaments</h2>
          {ts.map((t) => (<div className="o-rowline" key={t.id}><Link to={`/owner/tournaments/${t.id}`}>{t.name}</Link><Tag tone={t.status === "ongoing" ? "ok" : ""}>{t.status === "registration" ? "Upcoming" : t.status}</Tag></div>))}
        </section>
      </div>
    </div>
  );
}
