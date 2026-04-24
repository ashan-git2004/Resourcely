import React from "react";

export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function formatEnum(value) {
  if (!value) return "—";
  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getBadgeTone(kind, value) {
  const tones = {
    booking: {
      PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      APPROVED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      REJECTED: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      CANCELLED: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    },
    resource: {
      ACTIVE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      OUT_OF_SERVICE: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    ticketStatus: {
      OPEN: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
      IN_PROGRESS: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      RESOLVED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      CLOSED: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
      REJECTED: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    },
    priority: {
      LOW: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      MEDIUM: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      HIGH: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
      URGENT: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    },
    provider: {
      GOOGLE: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
      LOCAL: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
      CREDENTIALS: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    },
    checkedIn: {
      // Indigo makes it stand out from standard "Emerald" approvals
      true: "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
      false: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    },
  };

  return (
    tones[kind]?.[value] ||
    "border-border bg-muted text-muted-foreground"
  );
}

export function Badge({ children, tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        tone
      )}
    >
      {children}
    </span>
  );
}

export function AlertMessage({ type = "info", children }) {
  const tone = {
    error: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    info: "border-border bg-muted/50 text-foreground",
  }[type];

  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-sm", tone)}>
      {children}
    </div>
  );
}

export function FullBleedShell({ children }) {
  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 shadow-sm backdrop-blur-sm sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          {eyebrow && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {eyebrow}
            </span>
          )}
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function Panel({ className = "", children }) {
  return (
    <div className={cn("rounded-3xl border border-border bg-card p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, helper, icon }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          {helper ? <p className="mt-1 text-sm text-muted-foreground">{helper}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl">
        ✨
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Field({ label, value, multiline = false }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={cn("mt-2 text-sm text-foreground", multiline && "whitespace-pre-wrap leading-6")}>
        {value || "—"}
      </div>
    </div>
  );
}

export function buttonClasses(variant = "primary") {
  const shared =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "bg-primary text-primary-foreground shadow-sm hover:opacity-90",
    secondary: "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
    ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    danger: "border border-rose-500/20 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:text-rose-300",
  };

  return cn(shared, variants[variant]);
}

export function inputClasses() {
  return "flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
}

export function selectClasses() {
  return cn(inputClasses(), "appearance-none pr-10");
}

export function textareaClasses() {
  return "flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-3 text-sm shadow-sm transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
}

export function ModalShell({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function TableShell({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
