import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markAsRead, markAllAsRead } from "./notificationService";

export default function NotificationsPage() {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await getNotifications(auth.token);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await markAsRead(id, auth.token);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead(auth.token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1>Notification History</h1>
        <button onClick={handleMarkAllAsRead} className="ghost-btn">
          Mark All Read
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="muted">No notifications yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notif-item card ${!notif.isRead ? "notif-unread" : ""}`}
              style={{ boxShadow: "none", cursor: "pointer" }}
              onClick={() => handleMarkAsRead(notif.id)}
            >
              <Link to={`/tickets/${notif.relatedTicketId}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                   <div style={{ fontWeight: 700 }}>{notif.title}</div>
                   {!notif.isRead && <span className="badge" style={{ background: "var(--accent-2)", color: "white" }}>New</span>}
                </div>
                <div style={{ margin: "0.4rem 0" }}>{notif.message}</div>
                <div className="muted" style={{ fontSize: "0.8rem" }}>{new Date(notif.createdAt).toLocaleString()}</div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
