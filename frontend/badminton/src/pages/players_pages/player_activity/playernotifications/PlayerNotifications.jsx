import { useState } from "react";
import "./PlayerNotifications.css";
const START = [
  { id: 1, text: "Coach Nandi added 3 drills to your plan", time: "Today", read: false },
  { id: 2, text: "Saturday session moved to Court 2", time: "Yesterday", read: false },
  { id: 3, text: "You earned the Rising star badge", time: "3 days ago", read: true },
];
export default function PlayerNotifications() {
  const [list, setList] = useState(START);
  const unread = list.filter((n) => !n.read).length;
  return (
    <div className="pnn">
      <div className="pnn-head"><p>{unread} unread</p>
        <button disabled={!unread} onClick={() => setList(list.map((n) => ({ ...n, read: true })))}>Mark all as read</button></div>
      {list.map((n) => (<div key={n.id} className={`pnn-item ${n.read ? "" : "is-new"}`}><p>{n.text}</p><small>{n.time}</small></div>))}
    </div>
  );
}
