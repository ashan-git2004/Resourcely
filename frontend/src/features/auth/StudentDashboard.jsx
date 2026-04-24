import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { auth } = useAuth();

  const quickLinks = [
    {
      to: "/dashboard/student/bookings",
      icon: "📅",
      title: "My Bookings",
      description: "View, filter, and manage your resource requests.",
      accent: "from-sky-500/20 via-sky-500/10 to-transparent",
    },
    {
      to: "/dashboard/student/tickets",
      icon: "🎫",
      title: "My Tickets",
      description: "Report issues and track campus incident tickets.",
      accent: "from-orange-500/20 via-orange-500/10 to-transparent",
    },
  ];

  const accountInfo = [
    { label: "Email", value: auth?.email || "—" },
    { label: "Role", value: "Student" },
    { label: "Registration Provider", value: auth?.provider || "Credentials" },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Student Workspace
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Welcome back
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Access campus resources, manage your bookings, and track support
              requests from one streamlined dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard/student/bookings"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Open My Bookings
              </Link>

              <Link
                to="/dashboard/student/tickets"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                Open My Tickets
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">
              Account overview
            </h2>

            <div className="mt-4 space-y-3">
              {accountInfo.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-card px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${link.accent} opacity-0 transition duration-300 group-hover:opacity-100`}
            />
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-3xl transition-transform duration-300 group-hover:scale-105">
                {link.icon}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {link.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {link.description}
              </p>

              <div className="mt-5 inline-flex items-center text-sm font-medium text-primary">
                Open workspace
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          What you can do here
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use this dashboard as your starting point for the two most important
          student workflows.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-2xl">📅</div>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              Booking management
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create new booking requests, review approval status, and manage
              existing reservations in one place.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="text-2xl">🎫</div>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              Support tracking
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Report issues, follow updates, and keep track of ticket progress
              without leaving the student workspace.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/dashboard/student/bookings"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Go to bookings
          </Link>

          <Link
            to="/dashboard/student/tickets"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            Go to tickets
          </Link>

          <Link
            to="/login"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            Switch account
          </Link>
        </div>
      </section>
    </main>
  );
}