import React from "react";

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const buttonStyles = {
  primary:
    "inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ghost:
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 disabled:pointer-events-none disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800",
  danger:
    "inline-flex items-center justify-center rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:pointer-events-none disabled:opacity-50 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60",
};

export const fieldClass =
  "flex h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export const textAreaClass = `${fieldClass} min-h-[112px] py-3`;

export function FullBleedShell({ children }) {
  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

// export function PageHeader({ eyebrow, title, description, actions, aside }) {
//   return (
//     <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
//       <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
//         <div>
//           {eyebrow ? (
//             <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
//               {eyebrow}
//             </span>
//           ) : null}
//           <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
//             {title}
//           </h1>
//           {description ? (
//             <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base dark:text-zinc-300">
//               {description}
//             </p>
//           ) : null}
//           {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
//         </div>
//         {aside ? (
//           <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
//             {aside}
//           </div>
//         ) : null}
//       </div>
//     </section>
//   );
// }

export function PageHeader({ eyebrow, title, description, actions, aside }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      {/* Reduced padding and gap, added items-center so the aside aligns nicely */}
      <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          {eyebrow && (
            <span className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
              {eyebrow}
            </span>
          )}
          
          <h1 className="mt-1.5 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl dark:text-white">
            {title}
          </h1>
          
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
              {description}
            </p>
          )}
          
          {actions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>

        {aside && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}

export function StatGrid({ items }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {item.value}
              </p>
              {item.helper ? (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{item.helper}</p>
              ) : null}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-2xl dark:bg-sky-950/40">
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export function SectionCard({ title, description, actions, children, className = "" }) {
  return (
    <section className={cx(
      "rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8",
      className
    )}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">{title}</h2> : null}
            {description ? <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}
      <div className={title || description || actions ? "mt-6" : ""}>{children}</div>
    </section>
  );
}

export function Alert({ tone = "info", children }) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
    warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  };

  return (
    <div className={cx("rounded-2xl border px-4 py-3 text-sm leading-6", tones[tone])}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
    cancelled: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    progress: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
    resolved: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300",
    high: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    urgent: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
  };

  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide", tones[tone] || tones.neutral)}>
      {children}
    </span>
  );
}

export function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-950/40">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-zinc-900">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function DataTable({ columns, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-950/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, description, children, width = "max-w-2xl" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-950/70 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cx(
          "w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900",
          width
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800 sm:px-8">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">{title}</h3>
            {description ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className={cx(buttonStyles.ghost, "h-10 w-10 px-0 py-0")} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

export function InfoList({ items }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {item.label}
          </dt>
          <dd className="mt-2 text-sm leading-6 text-zinc-900 dark:text-zinc-100">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
