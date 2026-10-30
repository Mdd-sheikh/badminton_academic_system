import { useState } from "react";
import "./Players.css";
const DATA = [
    { id: 1, name: "Riya Sen", age: 16, batch: "Elite", level: "Advanced", status: "Active" },
    { id: 2, name: "Arjun Das", age: 14, batch: "Senior", level: "Intermediate", status: "Active" },
    { id: 3, name: "Meera Paul", age: 11, batch: "Junior", level: "Beginner", status: "Active" },
    { id: 4, name: "Kabir Roy", age: 17, batch: "Elite", level: "Advanced", status: "Injured" },
    { id: 5, name: "Tara Ghosh", age: 12, batch: "Junior", level: "Beginner", status: "Inactive" },
];
export default function Players() {
    const [q, setQ] = useState("");
    const [batch, setBatch] = useState("All");
    const rows = DATA.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) && (batch === "All" || p.batch === batch));
    return (
        <div className="pl">
            <div className="pl-bar">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name" aria-label="Filter players" />
                <select value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Batch">
                    {["All", "Junior", "Senior", "Elite"].map((b) => <option key={b}>{b}</option>)}
                </select>
                <button className="pl-btn">Add player</button>
            </div>
            <div className="pl-wrap">
                <table>
                    <thead><tr><th>Name</th><th>Age</th><th>Batch</th><th>Level</th><th>Status</th></tr></thead>
                    <tbody>
                        {rows.map((p) => (
                            <tr key={p.id}><td>{p.name}</td><td>{p.age}</td><td>{p.batch}</td><td>{p.level}</td>
                                <td><span className={`pl-tag pl-${p.status.toLowerCase()}`}>{p.status}</span></td></tr>
                        ))}
                        {!rows.length && <tr><td colSpan="5" className="pl-empty">No players match. Clear the filter or add a player.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
