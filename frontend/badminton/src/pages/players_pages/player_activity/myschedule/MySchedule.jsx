import "./MySchedule.css";
const S = [
  ["Tomorrow", "4:30 PM", "Doubles strategy", "Court 1"],
  ["Saturday", "4:30 PM", "Match practice", "Court 2"],
  ["Tuesday", "4:30 PM", "Footwork and fitness", "Court 1"],
  ["14 Nov", "9:00 AM", "Kolkata Junior Open, round 1", "Salt Lake Indoor Stadium"],
];
export default function MySchedule() {
  return (
    <div className="msc">
      {S.map(([d, t, n, v]) => (
        <div className="msc-row" key={d + n}><b>{d}</b><span>{t}</span><div><p>{n}</p><em>{v}</em></div></div>
      ))}
    </div>
  );
}
