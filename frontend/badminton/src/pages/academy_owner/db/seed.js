// Realistic dummy data, generated once into IndexedDB
import { STORES, getAll, putMany, clear, emit, iso, addDays, todayISO, DOW } from "../db/db.js";
import { genKnockout, genLeague, applyResult, merge, champion } from "../db/tournamentLogic";

// Demo login credentials (plain text is fine for a demo, never for production)
const DEMO_COACH_PASSWORD = "coach123";
const DEMO_ADMIN = {
  id: "admin",
  name: "Academy Admin",
  email: "admin@smashpoint.in",
  password: "admin123",
  role: "admin",
};

const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function build() {
  const R = rng(2026);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const rnd = (a, b) => Math.round(a + R() * (b - a));
  const clip = (v) => Math.max(20, Math.min(98, v));
  const today = todayISO();

  const FN = ["Aarav", "Vihaan", "Arjun", "Reyansh", "Ishaan", "Kabir", "Rohan", "Dev", "Aditya", "Rahul", "Ananya", "Diya", "Meera", "Riya", "Isha", "Tara", "Sana", "Anaya", "Kiara", "Nisha", "Saanvi", "Myra", "Aditi", "Priya"];
  const LN = ["Sharma", "Das", "Sen", "Paul", "Ghosh", "Roy", "Basu", "Nair", "Khan", "Dey", "Bose", "Mitra", "Saha", "Singh", "Gupta", "Banerjee", "Chatterjee", "Mukherjee"];

  const coaches = [["Subrata Nandi", "Singles tactics"], ["Kavita Rao", "Footwork & agility"], ["Imran Sheikh", "Doubles play"], ["Pooja Menon", "Junior development"], ["Anirban Pal", "Strength & stamina"], ["Neha Kapoor", "Stroke technique"]]
    .map((c, i) => ({ id: `c${i + 1}`, name: c[0], specialty: c[1], phone: "98" + rnd(10000000, 99999999), email: `${c[0].split(" ")[0].toLowerCase()}@smashpoint.in`, password: DEMO_COACH_PASSWORD, status: "Active", joined: addDays(today, -rnd(200, 900)) }));

  const bdefs = [
    ["Junior Morning", "Beginner", ["Mon", "Wed", "Fri"], "06:00", 8, 11], ["Junior Evening", "Beginner", ["Tue", "Thu", "Sat"], "16:00", 9, 12],
    ["Sub-Junior", "Intermediate", ["Mon", "Wed", "Fri"], "17:30", 12, 14], ["Senior", "Intermediate", ["Tue", "Thu", "Sat"], "18:00", 14, 17],
    ["Elite", "Advanced", ["Mon", "Tue", "Wed", "Thu", "Fri"], "19:00", 15, 19], ["Weekend Warriors", "Beginner", ["Sat", "Sun"], "08:00", 9, 13],
  ];
  const batches = bdefs.map((b, i) => ({ id: `b${i + 1}`, name: b[0], level: b[1], days: b[2], time: b[3], coachId: coaches[i].id, court: (i % 4) + 1, capacity: 12 }));

  const players = [], rel = {};
  bdefs.forEach((b, bi) => {
    for (let k = 0; k < 9; k++) {
      const fn = pick(FN), ln = pick(LN), id = `p${bi * 9 + k + 1}`;
      rel[id] = 0.68 + R() * 0.3;
      players.push({ id, name: `${fn} ${ln}`, age: rnd(b[4], b[5]), gender: FN.indexOf(fn) < 10 ? "Male" : "Female", batchId: `b${bi + 1}`, parentName: `${pick(["Mr.", "Mrs."])} ${pick(LN)}`, parentPhone: "97" + rnd(10000000, 99999999), status: bi * 9 + k > 50 ? "Inactive" : "Active", joined: addDays(today, -rnd(100, 600)) });
    }
  });

  const att = [];
  for (let k = 80; k >= 1; k--) {
    const ds = addDays(today, -k), dow = DOW[new Date(ds + "T00:00").getDay()];
    batches.forEach((b) => {
      if (!b.days.includes(dow)) return;
      const marks = {};
      players.filter((p) => p.batchId === b.id && p.status === "Active").forEach((p) => { const r = R(); marks[p.id] = r < rel[p.id] ? "P" : r < rel[p.id] + 0.04 ? "L" : "A"; });
      att.push({ id: `${b.id}|${ds}`, batchId: b.id, date: ds, marks, by: "Coach · " + coaches.find((c) => c.id === b.coachId).name, updatedAt: ds });
    });
  }

  const perf = [];
  players.filter((p) => p.status === "Active").forEach((p) => {
    const base = rnd(45, 80);
    for (let m = 0; m < 3; m++) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - m);
      const metrics = {};
      ["footwork", "stroke", "stamina", "tactics", "consistency"].forEach((k) => { metrics[k] = clip(base - m * rnd(1, 4) + rnd(-8, 8)); });
      perf.push({ id: `${p.id}|${iso(d).slice(0, 7)}`, playerId: p.id, month: iso(d).slice(0, 7), metrics, note: pick(["Good progress this month.", "Needs more work on consistency.", "Strong match temperament.", "Footwork is improving steadily.", "Focus on stamina drills next month."]), by: "Coach · " + coaches.find((c) => c.id === batches.find((b) => b.id === p.batchId).coachId).name, updatedAt: iso(d) });
    }
  });

  const active = players.filter((p) => p.status === "Active");
  const TN = ["Smash Hawks", "Net Ninjas", "Drop Shot Dragons", "Court Kings", "Shuttle Storm", "Rally Rockets", "Birdie Blazers", "Clear Champions"];
  const teams = TN.map((n, i) => ({ id: `team${i + 1}`, name: n, playerIds: [0, 1, 2, 3].map((k) => active[(i * 5 + k * 7) % active.length].id).filter((v, x, a) => a.indexOf(v) === x) }));

  const scores = (aWins) => { const two = R() < 0.55; const pat = two ? [aWins, aWins] : R() < 0.5 ? [aWins, !aWins, aWins] : [!aWins, aWins, aWins]; return pat.map((aw) => { const l = rnd(8, 19); return aw ? [21, l] : [l, 21]; }); };
  const play = (t, ms, ok) => { let cur = ms; cur.filter((m) => ok(m)).sort((a, b) => a.round - b.round).forEach((m0) => { const m = cur.find((x) => x.id === m0.id); if (m.a && m.b && m.status !== "completed") { const r = applyResult(cur, m.id, scores(R() < 0.5), t.format === "knockout"); if (r.changed) cur = merge(cur, r.changed); } }); return cur; };

  const e1 = active.filter((p) => ["b4", "b5"].includes(p.batchId)).slice(0, 8).map((p, i) => ({ id: `e${i + 1}`, name: p.name, members: [p.id] }));
  const t1 = { id: "t1", name: "Kolkata Junior Open 2026", start: addDays(today, -35), end: addDays(today, -33), venue: "Netaji Indoor Stadium", category: "Singles · Open", entrantType: "singles", format: "knockout", courts: 4, rules: "Best of 3 sets to 21, rally scoring. Seeding by academy rating. Two-minute interval between sets.", status: "completed", championId: null, entrants: e1 };
  let m1 = play(t1, genKnockout(t1, e1), () => true); t1.championId = champion(t1, e1, m1);

  const e2 = teams.slice(0, 6).map((tm, i) => ({ id: `e${i + 1}`, name: tm.name, members: tm.playerIds }));
  const t2 = { id: "t2", name: "SmashPoint Team League 2026", start: addDays(today, -9), end: addDays(today, 8), venue: "SmashPoint Arena", category: "Teams · Mixed", entrantType: "team", format: "league", courts: 3, rules: "Round robin. Two points for a win. Ties broken by set difference, then point difference.", status: "ongoing", championId: null, entrants: e2 };
  const m2 = play(t2, genLeague(t2, e2), (m) => m.date < today);

  const e3 = active.filter((p) => p.age >= 13 && p.age <= 17).slice(0, 6).map((p, i) => ({ id: `e${i + 1}`, name: p.name, members: [p.id] }));
  const t3 = { id: "t3", name: "Under-17 State Cup", start: addDays(today, 21), end: addDays(today, 23), venue: "Salt Lake Indoor Stadium", category: "Singles · Under-17", entrantType: "singles", format: "knockout", courts: 4, rules: "Knockout, best of 3 sets to 21. Players must be under 17 on the first day.", status: "registration", championId: null, entrants: e3 };

  return {
    coaches, batches, players, attendance: att, performance: perf, teams,
    tournaments: [t1, t2, t3], matches: [...m1, ...m2],
    // Admin login record (read by Auth.jsx from the "meta" store)
    meta: [DEMO_ADMIN],
  };
}

async function writeAll(d) {
  for (const s of STORES) await clear(s);
  for (const [k, v] of Object.entries(d)) await putMany(k, v);
  await putMany("meta", [{ id: "seeded", at: Date.now() }]);
  emit();
}

let seeding;
export const ensureSeed = () => (seeding ??= getAll("meta").then((m) => (m.some((x) => x.id === "seeded") ? null : writeAll(build()))));
export const resetDemo = async () => { await writeAll(build()); };