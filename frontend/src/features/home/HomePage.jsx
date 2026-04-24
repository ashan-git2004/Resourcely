import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HomePage() {
  const { auth } = useAuth();

  const roles = auth?.roles || [];
  const isAdmin = roles.includes("ADMIN");
  const isTechnician = roles.includes("TECHNICIAN");
  const isManager = roles.includes("MANAGER");

  const roleBadges = useMemo(() => {
    if (!roles.length) return ["Pending Approval"];
    return roles.map((role) => role.charAt(0) + role.slice(1).toLowerCase());
  }, [roles]);

  const stats = [
    {
      label: "Upcoming bookings",
      value: "03",
      helper: "Next 7 days",
      icon: "📅",
    },
    {
      label: "Open tickets",
      value: "02",
      helper: "Need attention",
      icon: "🎫",
    },
    {
      label: "Available resources",
      value: "12",
      helper: "Ready to reserve",
      icon: "🏫",
    },
    {
      label: "Unread notifications",
      value: "05",
      helper: "Latest updates",
      icon: "🔔",
    },
  ];

  const primaryActions = useMemo(() => {
    const items = [
      {
        title: "My Bookings",
        description: "Create, review, and manage your resource reservations.",
        to: "/dashboard/student/bookings",
        icon: "📆",
        accent: "from-sky-500/20 via-sky-500/10 to-transparent",
      },
      {
        title: "Support Tickets",
        description: "Report issues and track updates from staff.",
        to: "/dashboard/student/tickets",
        icon: "🛠️",
        accent: "from-orange-500/20 via-orange-500/10 to-transparent",
      },
    ];

    if (isTechnician) {
      items.unshift({
        title: "Check-In Scanner",
        description: "Scan approved bookings and verify campus access.",
        to: "/check-in",
        icon: "✅",
        accent: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      });
    }

    if (isAdmin) {
      items.unshift(
        {
          title: "Admin Resources",
          description: "Manage rooms, equipment, and facilities.",
          to: "/admin/resources",
          icon: "🧩",
          accent: "from-violet-500/20 via-violet-500/10 to-transparent",
        },
        {
          title: "Admin Tickets",
          description: "Review ticket queues, assignments, and statuses.",
          to: "/admin/tickets",
          icon: "📋",
          accent: "from-pink-500/20 via-pink-500/10 to-transparent",
        }
      );
    }

    return items;
  }, [isAdmin, isTechnician]);

  const workspaceHighlights = useMemo(() => {
    const items = [
      "Reserve campus resources with clear booking status tracking.",
      "Create and follow support tickets with comments and updates.",
      "Stay informed through role-based notifications and alerts.",
    ];

    if (isAdmin) {
      items.unshift("Approve bookings, manage resources, and oversee operational workflows.");
    }

    if (isTechnician) {
      items.unshift("Handle field check-ins and support ticket progress from one workspace.");
    }

    if (isManager) {
      items.unshift("Review team operations and monitor service workload more efficiently.");
    }

    return items.slice(0, 4);
  }, [isAdmin, isTechnician, isManager]);

  const featureCards = [
    {
      title: "Fast booking flow",
      description:
        "Help users move from discovery to reservation quickly, with clear status visibility and less friction.",
      icon: "⚡",
    },
    {
      title: "Role-based workspace",
      description:
        "Surface the right actions for students, admins, technicians, and managers instead of showing everyone the same homepage.",
      icon: "🧭",
    },
    {
      title: "Clear system visibility",
      description:
        "Show counts, priorities, and pending work at a glance so users know what matters immediately.",
      icon: "📊",
    },
    {
      title: "Better trust and clarity",
      description:
        "Use stronger hierarchy, cleaner sections, and obvious calls to action so the UI feels intentional and reliable.",
      icon: "🔐",
    },
  ];

  const supportLinks = [
    {
      title: "Need help?",
      text: "Create a support ticket when equipment, rooms, or systems need attention.",
    },
    {
      title: "Manage account access",
      text: "Use the navbar to review notifications, preferences, and theme settings.",
    },
    {
      title: "Stay organized",
      text: "Track your bookings, ticket progress, and updates from one place.",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-8rem] top-24 h-80 w-80 rounded-full bg-chart-2/15 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-chart-5/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-xl backdrop-blur">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
            <div className="flex flex-col justify-center">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Smart Campus Portal
                </span>
                {roleBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Welcome back,
                <span className="mt-2 block bg-gradient-to-r from-primary via-chart-2 to-chart-5 bg-clip-text text-transparent">
                  manage campus work faster.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Book resources, follow support issues, and access the tools that match your role
                through a cleaner, more focused workspace.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex max-w-full items-center rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm">
                  Signed in as
                  <span className="ml-2 truncate font-medium text-foreground">
                    {auth?.email || "Unknown user"}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/dashboard/student/bookings"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  Go to My Bookings
                </Link>

                <Link
                  to="/dashboard/student/tickets"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                >
                  Open Support Tickets
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-border bg-background/80 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Today at a glance</h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    Live overview
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {workspaceHighlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-3 py-3"
                    >
                      <span className="mt-0.5 text-sm">•</span>
                      <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/80 p-5 shadow-sm">
                <p className="text-sm font-semibold text-foreground">Suggested next step</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Start with your active work first, then use the quick actions below to move into
                  bookings, tickets, or admin tasks without hunting through the app.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.helper}</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl transition group-hover:scale-105">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Quick actions
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                These are the fastest ways to move into the most important tasks for your current
                role.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {primaryActions.map((action) => (
              <Link
                key={`${action.title}-${action.to}`}
                to={action.to}
                className="group relative overflow-hidden rounded-2xl border border-border bg-background p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.accent} opacity-0 transition duration-300 group-hover:opacity-100`}
                />
                <div className="relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-3xl transition-transform duration-300 group-hover:scale-105">
                    {action.icon}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {action.description}
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
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Why this dashboard works better
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The homepage should act like a launchpad, not a brochure. It should show status,
              priorities, and direct paths into the real workflows.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-background p-5 transition duration-300 hover:border-primary/40"
                >
                  <div className="text-3xl">{feature.icon}</div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Recent activity
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This section is ready for live booking, ticket, and notification events when you wire
              the backend counts and activity feed.
            </p>

            <div className="mt-8 rounded-2xl border border-dashed border-border bg-background px-6 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl">
                🕘
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                No recent activity yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your latest bookings, ticket updates, and important system events can appear here.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/dashboard/student/bookings"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  View bookings
                </Link>
                <Link
                  to="/dashboard/student/tickets"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                >
                  View tickets
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Need help getting started?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Use the homepage to jump straight into work, and keep the navbar for notifications,
                preferences, and theme switching.
              </p>
            </div>

            <div className="grid gap-3">
              {supportLinks.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-background/80 p-4"
                >
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}