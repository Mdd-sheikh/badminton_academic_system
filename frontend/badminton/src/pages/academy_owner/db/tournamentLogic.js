// Pure tournament logic: fixtures, brackets, results, standings
import { addDays } from "./util";

const pad = (n) => String(n).padStart(2, "0");
const nextPow2 = (n) => { let s = 2; while (s < n) s *= 2; return s; };
const seedOrder = (size) => { let r = [1]; while (r.length < size) { const n = r.length * 2; r = r.flatMap((x) => [x, n + 1 - x]); } return r; };
export const roundName = (r, total) => { const rem = total - r; return rem === 0 ? "Final" : rem === 1 ? "Semifinal" : rem === 2 ? "Quarterfinal" : `Round of ${2 ** (rem + 1)}`; };
export const merge = (ms, changed) => ms.map((m) => changed.find((c) => c.id === m.id) || m);

const mk = (t, round, idx, name, a, b, date, i) => ({
  id: `${t.id}-r${round}-m${idx}`, tournamentId: t.id, round, idx, roundName: name, a, b,
  scores: [], winner: null, status: "scheduled", date,
  time: `${pad(9 + Math.floor(i / (t.courts || 4)))}:00`, court: (i % (t.courts || 4)) + 1, venue: t.venue, bye: false,
});

const nextId = (m) => `${m.tournamentId}-r${m.round + 1}-m${m.idx >> 1}`;

function propagate(ms) {
  const by = Object.fromEntries(ms.map((m) => [m.id, m]));
  const max = Math.max(...ms.map((m) => m.round));
  ms.forEach((m) => {
    if (m.winner && m.round < max) {
      const nx = by[nextId(m)];
      if (nx) { if (m.idx % 2 === 0) nx.a = m.winner; else nx.b = m.winner; }
    }
  });
  return ms;
}

export function genKnockout(t, entrants) {
  const size = nextPow2(Math.max(2, entrants.length));
  const rounds = Math.log2(size);
  const slots = seedOrder(size).map((s) => entrants[s - 1]?.id || null);
  const ms = [];
  for (let r = 1; r <= rounds; r++) {
    for (let i = 0; i < size / 2 ** r; i++) {
      ms.push(mk(t, r, i, roundName(r, rounds), r === 1 ? slots[2 * i] : null, r === 1 ? slots[2 * i + 1] : null, addDays(t.start, r - 1), i));
    }
  }
  ms.filter((m) => m.round === 1 && (!m.a || !m.b)).forEach((m) => { m.bye = true; m.status = "completed"; m.winner = m.a || m.b; });
  return propagate(ms);
}

export function genLeague(t, entrants) {
  let arr = entrants.map((e) => e.id);
  if (arr.length % 2) arr.push(null);
  const n = arr.length, ms = [];
  for (let r = 0; r < n - 1; r++) {
    let k = 0;
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      if (a && b) ms.push(mk(t, r + 1, k, `Group stage · Round ${r + 1}`, a, b, addDays(t.start, r * 3), k++));
    }
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }
  return ms;
}

export function applyResult(ms, id, scores, knockout) {
  const list = ms.map((m) => ({ ...m }));
  const m = list.find((x) => x.id === id);
  if (!m) return { error: "Match not found" };
  if (!m.a || !m.b) return { error: "Both sides must be decided first" };
  const sets = scores.filter((s) => s && s[0] !== "" && s[1] !== "" && s[0] != null && s[1] != null).map((s) => [+s[0], +s[1]]);
  let wa = 0, wb = 0, done = false;
  for (const [x, y] of sets) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0) return { error: "Enter valid scores" };
    if (x === y) return { error: "A set cannot end in a tie" };
    if (done) return { error: "Match is already decided, remove the extra set" };
    x > y ? wa++ : wb++;
    if (wa === 2 || wb === 2) done = true;
  }
  if (!done) return { error: "Best of 3: one side must win 2 sets" };
  const winner = wa > wb ? m.a : m.b;
  const max = Math.max(...list.map((x) => x.round));
  const nx = knockout && m.round < max ? list.find((x) => x.id === nextId(m)) : null;
  if (nx && nx.status === "completed" && m.winner && m.winner !== winner) return { error: "The next round is already played. Clear that result first" };
  m.scores = sets; m.winner = winner; m.status = "completed";
  if (nx) { if (m.idx % 2 === 0) nx.a = winner; else nx.b = winner; }
  return { changed: [m, nx].filter(Boolean) };
}

export function clearResult(ms, id, knockout) {
  const list = ms.map((m) => ({ ...m }));
  const m = list.find((x) => x.id === id);
  const max = Math.max(...list.map((x) => x.round));
  const nx = knockout && m.round < max ? list.find((x) => x.id === nextId(m)) : null;
  if (nx && nx.status === "completed") return { error: "The next round is already played. Clear that result first" };
  m.scores = []; m.winner = null; m.status = "scheduled";
  if (nx) { if (m.idx % 2 === 0) nx.a = null; else nx.b = null; }
  return { changed: [m, nx].filter(Boolean) };
}

export function standings(entrants, ms) {
  const T = Object.fromEntries(entrants.map((e) => [e.id, { id: e.id, name: e.name, p: 0, w: 0, l: 0, sf: 0, sa: 0, pf: 0, pa: 0, pts: 0 }]));
  ms.filter((m) => m.status === "completed" && !m.bye).forEach((m) => {
    const A = T[m.a], B = T[m.b];
    if (!A || !B) return;
    A.p++; B.p++;
    m.scores.forEach(([x, y]) => { A.pf += x; A.pa += y; B.pf += y; B.pa += x; x > y ? (A.sf++, B.sa++) : (B.sf++, A.sa++); });
    if (m.winner === m.a) { A.w++; B.l++; A.pts += 2; } else { B.w++; A.l++; B.pts += 2; }
  });
  return Object.values(T).sort((x, y) => y.pts - x.pts || (y.sf - y.sa) - (x.sf - x.sa) || (y.pf - y.pa) - (x.pf - x.pa));
}

export function champion(t, entrants, ms) {
  if (!ms.length) return null;
  if (t.format === "knockout") {
    const max = Math.max(...ms.map((m) => m.round));
    return ms.find((m) => m.round === max && m.idx === 0)?.winner || null;
  }
  return ms.every((m) => m.status === "completed") ? standings(entrants, ms)[0]?.id || null : null;
}
