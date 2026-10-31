import "./PlayerNotifications.css";
import { usePlayerData } from "../../../academy_owner/db/playerAccess.js";
import PlayerState from "../../../../cards/share/PlayerState";

export default function PlayerNotifications() {
  const d = usePlayerData();
  if (!d.player) return <PlayerState loading={d.loading} />;

  const { notifications: list, unread } = d;
  return (
    <div className="pnn">
      <div className="pnn-head"><p>{unread} unread</p>
        <button disabled={!unread} onClick={d.markAllRead}>Mark all as read</button></div>
      {list.length === 0 && <div className="pnn-item"><p>You are all caught up.</p></div>}
      {list.map((n) => (<div key={n.id} className={`pnn-item ${n.read ? "" : "is-new"}`}><p>{n.text}</p><small>{n.time}</small></div>))}
    </div>
  );
}
