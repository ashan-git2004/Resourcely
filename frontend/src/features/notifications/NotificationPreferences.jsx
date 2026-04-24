import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "./notificationService";

function PreferenceSwitch({ checked, onToggle, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={[
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked
          ? "border-primary bg-primary"
          : "border-border bg-muted",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

export default function NotificationPreferences({ onClose }) {
  const { auth } = useAuth();

  const [preferences, setPreferences] = useState({
    bookingNotifications: true,
    ticketNotifications: true,
    commentNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPreferences() {
      if (!auth?.token) return;

      setLoading(true);
      try {
        const data = await notificationService.getPreferences(auth.token);
        setPreferences({
          bookingNotifications: data.bookingNotifications,
          ticketNotifications: data.ticketNotifications,
          commentNotifications: data.commentNotifications,
        });
        setError("");
      } catch {
        setError("Failed to load preferences.");
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [auth?.token]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !saving) {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, saving]);

  function handleToggle(key) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    if (!auth?.token) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await notificationService.updatePreferences(preferences, auth.token);
      setMessage("Preferences saved successfully.");
      setTimeout(() => {
        setMessage("");
        onClose?.();
      }, 1200);
    } catch {
      setError("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const preferenceItems = [
    {
      key: "bookingNotifications",
      icon: "📅",
      label: "Booking notifications",
      desc: "Get updates when your bookings are approved, rejected, or changed.",
    },
    {
      key: "ticketNotifications",
      icon: "🎫",
      label: "Ticket status notifications",
      desc: "Get notified when ticket assignments or statuses change.",
    },
    {
      key: "commentNotifications",
      icon: "💬",
      label: "Comment notifications",
      desc: "Get notified when someone comments on your tickets.",
    },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose?.();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Notification Preferences
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose which updates you want to receive.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            aria-label="Close notification preferences"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          {preferenceItems.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.label}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.desc}
                </p>
              </div>

              <PreferenceSwitch
                checked={preferences[item.key]}
                onToggle={() => handleToggle(item.key)}
                disabled={saving}
                label={item.label}
              />
            </div>
          ))}

          {error && (
            <div
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
              role="status"
            >
              {message}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}