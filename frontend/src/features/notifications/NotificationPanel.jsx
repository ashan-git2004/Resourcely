import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import notificationService from './notificationService';

const NotificationPanel = () => {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [auth?.token]);

  const fetchNotifications = async () => {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(auth.token);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, isRead) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(notificationId, auth.token);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(auth.token);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId, auth.token);
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deleted && !deleted.read) setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'BOOKING': return '📅';
      case 'TICKET':  return '🎫';
      case 'COMMENT': return '💬';
      default:        return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const diffMs   = Date.now() - new Date(timestamp);
    const diffMins  = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays  = Math.floor(diffMs / 86400000);
    if (diffMins  < 1)  return 'Just now';
    if (diffMins  < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays  < 7)  return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="absolute top-[50px] right-0 z-[1000] w-[360px] max-w-[90vw] max-h-[600px] flex flex-col bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden border border-[#e0e0e0]">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-[#e0e0e0]">
        <h3 className="m-0 text-[18px] font-semibold flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            className="bg-transparent border-none text-[#0066cc] cursor-pointer text-xs underline px-2 py-1 hover:text-[#0052a3]"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && (
        <div className="px-5 py-5 text-center text-[#999]">Loading notifications…</div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-5 py-10 text-[#999]">
          <p>No notifications yet</p>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto max-h-[480px]">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`px-4 py-3 border-b border-[#f0f0f0] transition-colors cursor-default ${n.read ? 'bg-white hover:bg-[#f9f9f9]' : 'bg-[#f0f8ff] hover:bg-[#e8f4ff]'}`}
          >
            <div className="flex gap-3 justify-between">
              <div className="flex gap-[10px] flex-1">
                <span className="text-xl flex-shrink-0">{getTypeIcon(n.type)}</span>
                <div className="flex-1">
                  <h4 className="m-0 mb-1 text-sm font-semibold text-[#333]">{n.title}</h4>
                  <p className="m-0 mb-1 text-[13px] text-[#666] leading-snug">{n.message}</p>
                  {n.relatedResourceName && (
                    <small className="block text-[11px] text-[#888] mb-1">
                      Resource: {n.relatedResourceName}
                    </small>
                  )}
                  <small className="text-[11px] text-[#aaa]">{formatTime(n.createdAt)}</small>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!n.read && (
                  <button
                    className="bg-transparent border-none w-6 h-6 flex items-center justify-center cursor-pointer rounded text-xs text-[#0066cc] hover:bg-[#e6f2ff] transition-colors"
                    onClick={() => handleMarkAsRead(n.id, n.read)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="bg-transparent border-none w-6 h-6 flex items-center justify-center cursor-pointer rounded text-xs text-[#999] hover:bg-[#f5f5f5] hover:text-red-500 transition-colors"
                  onClick={() => handleDelete(n.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#e0e0e0] text-center text-[11px] text-[#aaa] bg-[#fafafa]">
        Notifications are checked every 30 seconds
      </div>
    </div>
  );
};

export default NotificationPanel;
