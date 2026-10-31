
// Shared coach data scope.
// A coach is resolved from the authenticated user passed through Outlet context
// or from common localStorage auth keys. Batch access is ALWAYS based on batch.coachId.
import { useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useStore } from "../db/db.js";
import { ensureSeed } from "../db/seed.js";

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
const email = (v) => String(v || "").trim().toLowerCase();

export function useCoachData() {
  const outlet = useOutletContext();
  const authUser = outlet?.user || outlet?.authUser || outlet?.currentUser || outlet || readAuthUser();

  const [coaches, coachesReady] = useStore("coaches");
  const [allBatches, batchesReady] = useStore("batches");
  const [allPlayers, playersReady] = useStore("players");
  const [allAttendance, attendanceReady] = useStore("attendance");
  const [allPerformance, performanceReady] = useStore("performance");
  const [allTournaments, tournamentsReady] = useStore("tournaments");
  const [allMatches, matchesReady] = useStore("matches");
  const [teams] = useStore("teams");

  useEffect(() => { ensureSeed().catch((err) => console.error("Academy database initialization failed", err)); }, []);

  const coach = useMemo(() => {
    const coachId = authUser?.coachId || authUser?.coach?.id ||
      (authUser?.role === "coach" ? authUser?.id : "");
    if (coachId) {
      const found = coaches.find((c) => c.id === coachId);
      if (found) return found;
    }
    const userEmail = email(authUser?.email || authUser?.coach?.email);
    const userPhone = digits(authUser?.phone || authUser?.mobile || authUser?.contact || authUser?.coach?.phone);
    const userName = email(authUser?.name || authUser?.fullName || authUser?.coach?.name);
    return coaches.find((c) =>
      (userEmail && email(c.email) === userEmail) ||
      (userPhone && digits(c.phone) === userPhone) ||
      (userName && email(c.name) === userName)
    ) || null;
  }, [authUser, coaches]);

  const batches = useMemo(
    () => coach ? allBatches.filter((b) => b.coachId === coach.id) : [],
    [allBatches, coach]
  );
  const batchIds = useMemo(() => new Set(batches.map((b) => b.id)), [batches]);
  const players = useMemo(
    () => allPlayers.filter((p) => batchIds.has(p.batchId)),
    [allPlayers, batchIds]
  );
  const playerIds = useMemo(() => new Set(players.map((p) => p.id)), [players]);
  const attendance = useMemo(
    () => allAttendance.filter((a) => batchIds.has(a.batchId)),
    [allAttendance, batchIds]
  );
  const performance = useMemo(
    () => allPerformance.filter((p) => playerIds.has(p.playerId)),
    [allPerformance, playerIds]
  );
  const tournaments = useMemo(() => allTournaments.filter((t) =>
    t.entrants?.some((e) => e.members?.some((id) => playerIds.has(id)))
  ), [allTournaments, playerIds]);
  const tournamentIds = useMemo(() => new Set(tournaments.map((t) => t.id)), [tournaments]);
  const matches = useMemo(
    () => allMatches.filter((m) => tournamentIds.has(m.tournamentId)),
    [allMatches, tournamentIds]
  );

  const loading = ![coachesReady, batchesReady, playersReady, attendanceReady,
    performanceReady, tournamentsReady, matchesReady].every(Boolean);

  return {
    authUser, coach, batches, players, attendance, performance,
    tournaments, matches, teams, loading, batchIds, playerIds,
    allBatches, allPlayers, allAttendance
  };
}
