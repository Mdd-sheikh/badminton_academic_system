import { useState } from "react";
import "./ParentNotifications.css";
const START = [
  { id: 1, text: "Aarav won his match against Rohan Dey", time: "Today", read: false },
  { id: 2, text: "Session moved to Court 1 on Saturday", time: "Yesterday", read: false },
  { id: 3, text: "Monthly progress report is ready", time: "3 days ago", read: true },
];
export default function ParentNotifications() {
  const [list, setList] = useState(START);
  const unread = list.filter((n) => !n.read).length;
  return (
    <div className="pnt">
      <div className="pnt-head">
        <p>{unread} unread</p>
        <button disabled={!unread} onClick={() => setList(list.map((n) => ({ ...n, read: true })))}>Mark all as read</button>
      </div>
      {list.map((n) => (
        <div key={n.id} className={`pnt-item ${n.read ? "" : "is-new"}`}><p>{n.text}</p><small>{n.time}</small></div>
      ))}
    </div>
  );
}
