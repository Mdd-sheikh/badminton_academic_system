// Shared player data scope (player-side twin of coachAccess.js).
// The player is resolved from the logged-in user in localStorage ("user"), which Auth.jsx
// fills with linkedPlayerId / linkedPlayerIds for parent logins. Everything shown on the
// player dashboard is read from IndexedDB; small bits of player state (drill ticks,
// read notifications, alert settings, tournament interest) are saved into the "meta" store.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useStore, save, addDays, todayISO, DOW, METRICS, avgOf } from "./db.js";
import { ensureSeed } from "./seed.js";

const ACTIVE_KEY = "sp-active-player";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_LABEL = { footwork: "Footwork", stroke: "Stroke", stamina: "Stamina", tactics: "Tactics", consistency: "Consistency" };

const DRILLS = {
  footwork: [["Footwork ladder", "10 minutes, 3 rounds"], ["Six-corner shadow", "8 minutes, 2 rounds"]],
  stroke: [["Smash practice", "30 shots each side"], ["Clear and drop drill", "40 shots"]],
  stamina: [["Stamina run", "20 minutes easy pace"], ["Skipping rope", "3 rounds of 2 minutes"]],
  tactics: [["Pattern play", "15 minutes, rally with a plan"], ["Match review", "Note 3 points to improve"]],
  consistency: [["Net drops", "50 reps"], ["Rally control", "20 minutes, keep the shuttle in play"]],
};

/* ------------------------------ small helpers ------------------------------ */

const readAuthUser = () => {
  for (const key of ["user", "authUser", "currentUser", "loggedInUser", "smashpoint-user"]) {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object") return parsed.user || parsed.data?.user || parsed;
      }
    } catch { /* Ignore unrelated or malformed storage values. */ }
  }
  return {};
};

const digits = (v) => String(v || "").replace(/\D/g, "");
const parseDay = (s) => new Date(s + "T00:00");
const dayDiff = (s) => Math.round((parseDay(s) - parseDay(todayISO())) / 86400000);

export const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  return `${h % 12 || 12}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
export const shortDate = (s) => {
  const d = parseDay(s);
  return `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const monthLabel = (ym) => MONTHS_LONG[Number(ym.slice(5, 7)) - 1] || ym;
export const monthShort = (ym) => MONTHS[Number(ym.slice(5, 7)) - 1] || ym;
export const dayLabel = (s) => {
  const n = dayDiff(s);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  const d = parseDay(s);
  if (n > 1 && n < 7) return d.toLocaleDateString("en-IN", { weekday: "long" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
export const whenLabel = (s) => {
  const n = dayDiff(s);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  return n > 1 ? `In ${n} days` : `${-n} days ago`;
};
const lastName = (name) => String(name || "").trim().split(/\s+/).pop();
const goalTarget = (v) => Math.min(100, Math.ceil((v + 1) / 5) * 5 + 5);

// Upcoming training dates for a batch (skips a session that has already started today).
export function sessionDates(batch, { from = 0, count = 6 } = {}) {
  if (!batch?.days?.length) return [];
  const out = [];
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const [h, m] = String(batch.time || "00:00").split(":").map(Number);
  for (let d = from; d < from + 60 && out.length < count; d++) {
    const ds = addDays(todayISO(), d);
    if (!batch.days.includes(DOW[parseDay(ds).getDay()])) continue;
    if (d === 0 && h * 60 + (m || 0) < mins) continue;
    out.push({ date: ds, time: batch.time, court: batch.court });
  }
  return out;
}

/* --------------------------------- the hook -------------------------------- */

export function usePlayerData() {
  const outlet = useOutletContext();
  const stored = useMemo(readAuthUser, []);
  const authUser = outlet?.user || stored;

  const [coaches, coachesReady] = useStore("coaches");
  const [batches, batchesReady] = useStore("batches");
  const [allPlayers, playersReady] = useStore("players");
  const [allAttendance, attendanceReady] = useStore("attendance");
  const [allPerformance, performanceReady] = useStore("performance");
  const [allTournaments, tournamentsReady] = useStore("tournaments");
  const [allMatches, matchesReady] = useStore("matches");
  const [metaRows, metaReady] = useStore("meta");

  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    ensureSeed().catch((err) => console.error("Academy database initialization failed", err)).finally(() => setSeeded(true));
  }, []);

  /* ---- which player(s) belong to this login ---- */
  const children = useMemo(() => {
    const ids = [...new Set([
      authUser?.linkedPlayerId, ...(authUser?.linkedPlayerIds || []), authUser?.playerId,
      authUser?.role === "player" ? authUser?.id : null,
    ].filter(Boolean))];
    const byId = ids.map((id) => allPlayers.find((p) => p.id === id)).filter(Boolean);
    if (byId.length) return byId;
    const phone = digits(authUser?.phone).slice(-10);
    return phone.length >= 7 ? allPlayers.filter((p) => digits(p.parentPhone).endsWith(phone)) : [];
  }, [authUser, allPlayers]);

  const [picked, setPicked] = useState(() => localStorage.getItem(ACTIVE_KEY) || "");
  const setActivePlayer = useCallback((id) => {
    localStorage.setItem(ACTIVE_KEY, id);
    setPicked(id);
  }, []);
  const wantedId = outlet?.playerId || picked;
  const player = children.find((p) => p.id === wantedId) || children[0] || null;

  /* ---- academy links ---- */
  const batch = useMemo(() => batches.find((b) => b.id === player?.batchId) || null, [batches, player]);
  const coach = useMemo(() => coaches.find((c) => c.id === batch?.coachId) || null, [coaches, batch]);

  /* ---- attendance ---- */
  const sessionsAsc = useMemo(() => {
    if (!player) return [];
    return allAttendance
      .filter((a) => a.batchId === player.batchId && a.marks && a.marks[player.id])
      .map((a) => ({ id: a.id, date: a.date, status: a.marks[player.id] }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allAttendance, player]);
  const attendance = useMemo(() => [...sessionsAsc].reverse(), [sessionsAsc]);

  const attStats = useMemo(() => {
    const attended = sessionsAsc.filter((s) => s.status !== "A").length;
    let cur = 0, best = 0;
    sessionsAsc.forEach((s) => { if (s.status !== "A") { cur++; best = Math.max(best, cur); } else cur = 0; });
    return { attended, total: sessionsAsc.length, pct: sessionsAsc.length ? Math.round((attended / sessionsAsc.length) * 100) : 0, streak: cur, bestStreak: best };
  }, [sessionsAsc]);

  /* ---- performance ---- */
  const performance = useMemo(
    () => (player ? allPerformance.filter((p) => p.playerId === player.id).sort((a, b) => a.month.localeCompare(b.month)) : []),
    [allPerformance, player]
  );
  const latest = performance[performance.length - 1] || null;
  const rating = latest ? avgOf(latest.metrics) : null;
  const skills = useMemo(
    () => (latest ? METRICS.map(([k]) => [SHORT_LABEL[k] || k, latest.metrics[k] || 0, k]) : []),
    [latest]
  );
  const monthly = useMemo(() => performance.slice(-6).map((p) => [monthShort(p.month), avgOf(p.metrics)]), [performance]);
  const goals = useMemo(() => {
    if (!latest) return [];
    const weakest = [...skills].sort((a, b) => a[1] - b[1])[0];
    return [
      [`Reach rating ${goalTarget(rating)}`, rating, goalTarget(rating)],
      [`Raise ${weakest[0].toLowerCase()} to ${goalTarget(weakest[1])}`, weakest[1], goalTarget(weakest[1])],
    ];
  }, [latest, skills, rating]);

  /* ---- tournaments and matches ---- */
  const interestDoc = metaRows.find((r) => r.id === `pl-interest|${player?.id}`);
  const interestIds = interestDoc?.ids || [];
  const tournaments = useMemo(() => {
    if (!player) return [];
    return [...allTournaments]
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((t) => ({
        ...t,
        entered: Boolean(t.entrants?.some((e) => e.members?.includes(player.id))),
        interested: interestIds.includes(t.id),
      }));
  }, [allTournaments, player, interestIds.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  const matches = useMemo(() => {
    if (!player) return [];
    const out = [];
    allTournaments.forEach((t) => {
      const mine = t.entrants?.find((e) => e.members?.includes(player.id));
      if (!mine) return;
      allMatches.filter((m) => m.tournamentId === t.id && !m.bye && (m.a === mine.id || m.b === mine.id)).forEach((m) => {
        const meIsA = m.a === mine.id;
        const oppId = meIsA ? m.b : m.a;
        const completed = m.status === "completed";
        out.push({
          ...m,
          tournamentName: t.name,
          opponent: t.entrants.find((e) => e.id === oppId)?.name || "To be decided",
          sets: (m.scores || []).map(([x, y]) => (meIsA ? [x, y] : [y, x])),
          completed,
          won: completed ? m.winner === mine.id : null,
        });
      });
    });
    return out;
  }, [allTournaments, allMatches, player]);

  const today = todayISO();
  const upcoming = useMemo(
    () => matches.filter((m) => !m.completed && m.a && m.b && m.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [matches, today]
  );
  const completed = useMemo(
    () => matches.filter((m) => m.completed).sort((a, b) => b.date.localeCompare(a.date)),
    [matches]
  );
  const stats = { ...attStats, wins: completed.filter((m) => m.won).length, played: completed.length };

  const nextSession = useMemo(() => sessionDates(batch, { count: 1 })[0] || null, [batch]);
  const sessions = useMemo(() => sessionDates(batch, { count: 8 }), [batch]);

  /* ---- achievements (computed from real data) ---- */
  const achievements = useMemo(() => {
    const byMonth = {};
    sessionsAsc.forEach((s) => { (byMonth[s.date.slice(0, 7)] ||= []).push(s); });
    const perfectMonth = Object.values(byMonth).some((list) => list.length >= 4 && list.every((s) => s.status !== "A"));
    const rise = performance.length >= 2
      ? avgOf(performance[performance.length - 1].metrics) - avgOf(performance[0].metrics) : 0;
    return [
      { t: "First win", d: "Won your first academy match", got: completed.some((m) => m.won) },
      { t: "Five-session streak", d: "Attended 5 sessions in a row", got: attStats.bestStreak >= 5 },
      { t: "Rising star", d: "Raised your rating by 10 points", got: rise >= 10 },
      { t: "Tournament debut", d: "Play in your first tournament", got: completed.length > 0 },
      { t: "Perfect month", d: "Attend every session in a month", got: perfectMonth },
    ];
  }, [sessionsAsc, performance, completed, attStats.bestStreak]);

  /* ---- training plan: drills target the player's weakest skills ---- */
  const trainingDoc = metaRows.find((r) => r.id === `pl-training|${player?.id}`);
  const drillsDone = trainingDoc?.done || {};
  const training = useMemo(() => {
    if (!player) return [];
    const order = (latest ? [...METRICS].sort((a, b) => (latest.metrics[a[0]] || 0) - (latest.metrics[b[0]] || 0)) : METRICS).map(([k]) => k);
    const nextDate = sessionDates(batch, { from: 1, count: 1 })[0]?.date || addDays(todayISO(), 2);
    const pickDrill = (metric, i) => ({ id: `${metric}-${i}`, name: DRILLS[metric][i][0], detail: DRILLS[metric][i][1] });
    const day = (date, label, list) => list.map((x) => ({ ...x, date, day: label, key: `${date}|${x.id}` }));
    return [
      ...day(todayISO(), "Today", [pickDrill(order[0], 0), pickDrill(order[0], 1), pickDrill(order[1], 0)]),
      ...day(nextDate, dayLabel(nextDate), [pickDrill(order[1], 1), pickDrill(order[2], 0)]),
    ];
  }, [player, latest, batch]);

  /* ---- notifications (derived from real events, read state kept in meta) ---- */
  const notifDoc = metaRows.find((r) => r.id === `pl-notif|${player?.id}`);
  const readIds = notifDoc?.readIds || [];
  const notifications = useMemo(() => {
    if (!player) return [];
    const items = [];
    performance.slice(-2).forEach((p) => items.push({
      id: `perf-${p.id}`, date: p.updatedAt,
      text: `Coach ${lastName(coach?.name) || "your coach"} posted your ${monthLabel(p.month)} performance review`,
    }));
    sessionsAsc.filter((s) => s.status === "A" && dayDiff(s.date) >= -14).forEach((s) => items.push({
      id: `abs-${s.date}`, date: s.date, text: `You were marked absent on ${shortDate(s.date)}`,
    }));
    upcoming.filter((m) => dayDiff(m.date) <= 14).forEach((m) => items.push({
      id: `match-${m.id}`, date: m.date, text: `Match vs ${m.opponent} on ${shortDate(m.date)} at ${fmtTime(m.time)}`,
    }));
    completed.filter((m) => dayDiff(m.date) >= -21).forEach((m) => items.push({
      id: `res-${m.id}`, date: m.date, text: `You ${m.won ? "won" : "lost"} your match against ${m.opponent}`,
    }));
    tournaments.filter((t) => t.status === "registration" && !t.entered).forEach((t) => items.push({
      id: `reg-${t.id}`, date: todayISO(), time: "Open now", text: `Registration is open for ${t.name}`,
    }));
    return items
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15)
      .map((n) => ({ ...n, time: n.time || whenLabel(n.date), read: readIds.includes(n.id) }));
  }, [player, performance, sessionsAsc, upcoming, completed, tournaments, coach, readIds.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  const unread = notifications.filter((n) => !n.read).length;

  /* ---- saved player state (meta store) ---- */
  const settingsDoc = metaRows.find((r) => r.id === `pl-settings|${player?.id}`);
  const settings = { sessionReminders: true, matchAlerts: true, coachNotes: true, ...(settingsDoc?.alerts || {}) };

  const patchMeta = useCallback((id, patch) => {
    const cur = metaRows.find((r) => r.id === id) || {};
    return save("meta", { ...cur, ...patch, id });
  }, [metaRows]);

  const toggleDrill = (key) => patchMeta(`pl-training|${player.id}`, { done: { ...drillsDone, [key]: !drillsDone[key] } });
  const markAllRead = () => patchMeta(`pl-notif|${player.id}`, { readIds: [...new Set([...readIds, ...notifications.map((n) => n.id)])] });
  const saveAlerts = (alerts) => patchMeta(`pl-settings|${player.id}`, { alerts });
  const toggleInterest = (tid) => patchMeta(`pl-interest|${player.id}`, {
    ids: interestIds.includes(tid) ? interestIds.filter((x) => x !== tid) : [...interestIds, tid],
  });
  const saveProfile = ({ name, email, phone }) => save("players", { ...player, name: name.trim() || player.name, email: email.trim(), phone: phone.trim() });

  const loading = !seeded || ![coachesReady, batchesReady, playersReady, attendanceReady, performanceReady, tournamentsReady, matchesReady, metaReady].every(Boolean);

  return {
    authUser, loading, player, children, setActivePlayer, batch, coach,
    attendance, performance, latest, rating, skills, monthly, goals,
    tournaments, matches, upcoming, completed, stats, nextSession, sessions,
    achievements, training, drillsDone, toggleDrill,
    notifications, unread, markAllRead, settings, saveAlerts, saveProfile, toggleInterest,
  };
}
