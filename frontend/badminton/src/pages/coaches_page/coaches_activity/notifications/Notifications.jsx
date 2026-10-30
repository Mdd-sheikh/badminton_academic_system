import { useState } from "react";
import "./Notifications.css";
const START = [
  { id: 1, text: "Kabir Roy reported a shoulder strain", time: "10 min ago", read: false },
  { id: 2, text: "3 new registrations for Kolkata Junior Open", time: "2 hours ago", read: false },
  { id: 3, text: "Senior batch attendance is below 75%", time: "Yesterday", read: false },
  { id: 4, text: "Court 2 booking confirmed for Saturday", time: "2 days ago", read: true },
];
export default function Notifications() {
  const [list, setList] = useState(START);
  const unread = list.filter((n) => !n.read).length;
  const mark = (id) => setList(list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  return (
    <div className="nt">
      <div className="nt-head">
        <p>{unread} unread</p>
        <button disabled={!unread} onClick={() => setList(list.map((n) => ({ ...n, read: true })))}>Mark all as read</button>
      </div>
      {list.map((n) => (
        <div key={n.id} className={`nt-item ${n.read ? "" : "is-new"}`}>
          <div><p>{n.text}</p><small>{n.time}</small></div>
          {!n.read && <button onClick={() => mark(n.id)}>Mark as read</button>}
        </div>
      ))}
    </div>
  );
}
