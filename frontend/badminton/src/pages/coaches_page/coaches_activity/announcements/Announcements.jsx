import { useState } from "react";
import "./Announcements.css";
export default function Announcements() {
  const [items, setItems] = useState([{ id: 1, title: "Court 2 closed Friday", body: "Floor polishing. Elite batch moves to Court 1.", to: "Elite" }]);
  const [f, setF] = useState({ title: "", body: "", to: "All players" });
  const send = (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    setItems([{ id: Date.now(), ...f }, ...items]);
    setF({ title: "", body: "", to: "All players" });
  };
  return (
    <div className="an2">
      <form className="an2-form" onSubmit={send}>
        <h2>New announcement</h2>
        <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title" aria-label="Title" />
        <textarea rows="4" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder="Message" aria-label="Message" />
        <select value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} aria-label="Send to">
          {["All players", "Junior", "Senior", "Elite"].map((o) => <option key={o}>{o}</option>)}
        </select>
        <button type="submit">Send announcement</button>
      </form>
      <div className="an2-list">
        {items.map((i) => (<article key={i.id}><h3>{i.title}</h3><p>{i.body}</p><small>Sent to {i.to}</small></article>))}
      </div>
    </div>
  );
}
