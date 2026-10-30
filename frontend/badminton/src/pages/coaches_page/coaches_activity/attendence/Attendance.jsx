import { useState } from "react";
import "./Attendance.css";
const ROSTER = { Junior: ["Meera Paul", "Tara Ghosh", "Dev Nair"], Senior: ["Arjun Das", "Isha Basu"], Elite: ["Riya Sen", "Kabir Roy"] };
export default function Attendance() {
    const [batch, setBatch] = useState("Junior");
    const [present, setPresent] = useState({});
    const [saved, setSaved] = useState(false);
    const list = ROSTER[batch];
    const count = list.filter((n) => present[n]).length;
    const toggle = (n) => { setSaved(false); setPresent((p) => ({ ...p, [n]: !p[n] })); };
    return (
        <div className="at">
            <div className="at-bar">
                <select value={batch} onChange={(e) => { setBatch(e.target.value); setSaved(false); }} aria-label="Batch">
                    {Object.keys(ROSTER).map((b) => <option key={b}>{b}</option>)}
                </select>
                <span>{count} of {list.length} present</span>
            </div>
            <ul className="at-list">
                {list.map((n) => (
                    <li key={n}>
                        <label><input type="checkbox" checked={!!present[n]} onChange={() => toggle(n)} />{n}</label>
                    </li>
                ))}
            </ul>
            <button className="at-save" onClick={() => setSaved(true)}>Save attendance</button>
            {saved && <p className="at-ok" role="status">Attendance saved for {batch} batch.</p>}
        </div>
    );
}
