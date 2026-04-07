import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markAllAsRead, markAsRead } from "./notificationService";

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
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await markAsRead(id, auth.token);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead(auth.token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: "920px" }}>
      <div className="card">
        <div className="page-header" style={{ marginBottom: "1rem" }}>
          <div>
            <h1>Notification History</h1>
            <p className="muted">Track system alerts and ticket updates in one timeline.</p>
          </div>
          <button onClick={handleMarkAllAsRead} className="ghost-btn">
            Mark all as read
          </button>
        </div>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <p className="muted">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">No notifications yet</span>
            <p className="muted" style={{ margin: 0 }}>You will see ticket and workflow alerts here.</p>
          </div>
        ) : (
          <div className="comments-list">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item card ${!notif.isRead ? "notif-unread" : ""}`}
                style={{ boxShadow: "none", cursor: "pointer" }}
                onClick={() => handleMarkAsRead(notif.id)}
              >
                <Link to={`/tickets/${notif.relatedTicketId}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <div className="notif-title">{notif.title}</div>
                    {!notif.isRead && <span className="badge status-open">New</span>}
                  </div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">{new Date(notif.createdAt).toLocaleString()}</div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
