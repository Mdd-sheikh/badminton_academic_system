export const uid = (p = "x") => p + Math.random().toString(36).slice(2, 9);
export const iso = (d) => {
  const z = d instanceof Date ? d : new Date(d);
  return `${z.getFullYear()}-${String(z.getMonth() + 1).padStart(2, "0")}-${String(z.getDate()).padStart(2, "0")}`;
};
export const todayISO = () => iso(new Date());
export const addDays = (s, n) => { const x = new Date(s + "T00:00"); x.setDate(x.getDate() + n); return iso(x); };
export const fmtDate = (s) => (s ? new Date(s + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const METRICS = [
  ["footwork", "Footwork & Agility"],
  ["stroke", "Stroke Technique & Accuracy"],
  ["stamina", "Stamina & Endurance"],
  ["tactics", "Tactical Awareness & Game Strategy"],
  ["consistency", "Consistency & Match Performance"],
];
export const avgOf = (m) => Math.round(METRICS.reduce((s, [k]) => s + (m[k] || 0), 0) / METRICS.length);
