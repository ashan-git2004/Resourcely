import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "./notificationService";

const TYPE_META = {
  BOOKING: {
    icon: "📅",
    label: "Booking",
    badge:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  TICKET: {
    icon: "🎫",
    label: "Ticket",
    badge:
      "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  },
  COMMENT: {
    icon: "💬",
    label: "Comment",
    badge:
      "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  },
  DEFAULT: {
    icon: "🔔",
    label: "Notification",
    badge:
      "bg-muted text-muted-foreground border-border",
  },
};

function formatTime(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

export default function NotificationPanel() {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchNotifications() {
    if (!auth?.token) return;

    setLoading(true);
    try {
      const data = await notificationService.getNotifications(auth.token);
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // ignore for now
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();

    if (!auth?.token) return;

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [auth?.token]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  async function handleMarkAsRead(notificationId, isRead) {
    if (isRead || !auth?.token) return;

    try {
      await notificationService.markAsRead(notificationId, auth.token);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
    } catch {
      // ignore
    }
  }

  async function handleMarkAllAsRead() {
    if (!auth?.token || unreadCount === 0) return;

    try {
      await notificationService.markAllAsRead(auth.token);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      // ignore
    }
  }

  async function handleDelete(notificationId) {
    if (!auth?.token) return;

    try {
      await notificationService.deleteNotification(notificationId, auth.token);
      setNotifications((prev) =>
        prev.filter((item) => item.id !== notificationId)
      );
    } catch {
      // ignore
    }
  }

  return (
    <div className="absolute right-0 top-12 z-[1000] w-[380px] max-w-[92vw] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {unreadCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchNotifications}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-primary transition hover:bg-primary/10"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="space-y-3 px-4 py-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl">
            🔕
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No notifications yet
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Booking, ticket, and comment updates will show up here.
          </p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="max-h-[460px] overflow-y-auto">
          {notifications.map((item) => {
            const meta = TYPE_META[item.type] || TYPE_META.DEFAULT;

            return (
              <div
                key={item.id}
                className={[
                  "border-b border-border p-4 transition-colors",
                  item.read
                    ? "bg-popover hover:bg-accent/40"
                    : "bg-primary/5 hover:bg-primary/10",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                    {meta.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h4>

                      {!item.read && (
                        <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                          New
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.message}
                    </p>

                    {item.relatedResourceName && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Resource:{" "}
                        <span className="font-medium text-foreground">
                          {item.relatedResourceName}
                        </span>
                      </p>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatTime(item.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id, item.read)}
                        title="Mark as read"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm text-primary transition hover:bg-primary/10"
                      >
                        ✓
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title="Delete notification"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-border bg-muted/40 px-4 py-2 text-center text-[11px] text-muted-foreground">
        Notifications refresh every 30 seconds
      </div>
    </div>
  );
}