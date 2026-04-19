import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import notificationService from './notificationService';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [auth?.token]);

  const fetchNotifications = async () => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(auth.token);
      setNotifications(data);
      
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, isRead) => {
    if (isRead) return;
    
    try {
      await notificationService.markAsRead(notificationId, auth.token);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(auth.token);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId, auth.token);
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      if (deleted && !deleted.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return '📅';
      case 'TICKET':
        return '🎫';
      case 'COMMENT':
        return '💬';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h3>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading notifications...</div>}

      {!loading && notifications.length === 0 && (
        <div className="empty-state">
          <p>No notifications yet</p>
        </div>
      )}

      <div className="notifications-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
          >
            <div className="notification-content">
              <div className="notification-header-item">
                <span className="type-icon">{getTypeIcon(notification.type)}</span>
                <div className="notification-info">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  {notification.relatedResourceName && (
                    <small className="resource-name">Resource: {notification.relatedResourceName}</small>
                  )}
                  <small className="timestamp">{formatTime(notification.createdAt)}</small>
                </div>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="read-btn"
                    onClick={() => handleMarkAsRead(notification.id, notification.read)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(notification.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="notification-footer">
        <small>Notifications are checked every 30 seconds</small>
      </div>
    </div>
  );
};

export default NotificationPanel;
