import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markAsRead, markAllAsRead } from "./notificationService";

export default function NotificationBell() {
  const { auth, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Polling every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadNotifications() {
    try {
      const data = await getNotifications(auth.token);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }

  async function handleMarkAsRead(id) {
    try {
       await markAsRead(id, auth.token);
       setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
       setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead(auth.token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="notif-bell-container" ref={panelRef}>
      <div onClick={() => setShowPanel(!showPanel)} style={{ fontSize: "1.2rem", padding: "0.5rem" }}>
        🔔 {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </div>

      {showPanel && (
        <div className="notif-panel card" style={{ position: "absolute", top: "100%", right: 0, width: "320px", marginTop: "0.5rem", zIndex: 1000, padding: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderBottom: "1px solid var(--border)" }}>
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="action-link">Mark all as read</button>
            )}
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <p className="muted" style={{ padding: "1rem", textAlign: "center" }}>No notifications yet.</p>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notif-item ${!notif.isRead ? "notif-unread" : ""}`}
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <Link to={`/tickets/${notif.relatedTicketId}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-message">{notif.message}</div>
                    <div className="notif-time">{new Date(notif.createdAt).toLocaleString()}</div>
                  </Link>
                </div>
              ))
            )}
          </div>
          
          <Link to="/notifications" onClick={() => setShowPanel(false)} style={{ display: "block", textAlign: "center", padding: "0.75rem", borderTop: "1px solid var(--border)", textDecoration: "none" }} className="text-link">
            View all history
          </Link>
        </div>
      )}
    </div>
  );
}
