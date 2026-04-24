import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationPanel from "../features/notifications/NotificationPanel";
import NotificationPreferences from "../features/notifications/NotificationPreferences";

function navLinkClasses({ isActive }) {
  return [
    "inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  ].join(" ");
}

function dropdownLinkClasses({ isActive }) {
  return [
    "block rounded-md px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-foreground hover:bg-accent hover:text-accent-foreground",
  ].join(" ");
}

export default function Navbar() {
  const { isAuthenticated, auth, logout } = useAuth();
  const isAdmin = (auth?.roles || []).includes("ADMIN");
  const isTechnician = (auth?.roles || []).includes("TECHNICIAN");
  const isUser = (auth?.roles || []).includes("USER");

  const { theme, setTheme, resolvedTheme } = useTheme();

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const location = useLocation();

  const adminLinks = useMemo(
    () => [
      { to: "/admin/users", label: "Users" },
      { to: "/admin/resources", label: "Resources" },
      { to: "/admin/bookings", label: "Bookings" },
      { to: "/admin/tickets", label: "Tickets" },
    ],
    []
  );

  useEffect(() => {
    setAdminMenuOpen(false);
    setNotificationPanelOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setAdminMenuOpen(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationPanelOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setAdminMenuOpen(false);
        setNotificationPanelOpen(false);
        setShowPreferences(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to={isAuthenticated ? "/home" : "/"}
            className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
              SC
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none text-foreground">
                Smart Campus
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Resource bookings, tickets, and check-in
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={navLinkClasses}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLinkClasses}>
                  Signup
                </NavLink>
              </>
            )}

            {isAuthenticated && (
              <>
                {/* <NavLink to="/home" className={navLinkClasses}>
                  Home
                </NavLink> */}

                {isAdmin && (
                  <div className="relative" ref={adminMenuRef}>
                    <button
                      type="button"
                      onClick={() => setAdminMenuOpen((prev) => !prev)}
                      aria-expanded={adminMenuOpen}
                      aria-haspopup="menu"
                      className={[
                        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        adminMenuOpen
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      ].join(" ")}
                    >
                      Admin
                      <span
                        className={`text-xs transition-transform ${
                          adminMenuOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>

                    {adminMenuOpen && (
                      <div
                        className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl"
                        role="menu"
                      >
                        {adminLinks.map(({ to, label }) => (
                          <NavLink
                            key={to}
                            to={to}
                            className={dropdownLinkClasses}
                            onClick={() => setAdminMenuOpen(false)}
                          >
                            {label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isTechnician && (
                  <NavLink to="/check-in" className={navLinkClasses}>
                    Check-In
                  </NavLink>
                )}

                {isAdmin && (
                  <NavLink to="/check-in" className={navLinkClasses}>
                    Check-In
                  </NavLink>
                )}


                {isUser && (
                  <NavLink to="/dashboard/student/bookings" className={navLinkClasses}>
                    My Bookings
                  </NavLink>
                )}

                {isUser && (
                  <NavLink to="/dashboard/student/tickets" className={navLinkClasses}>
                    My Tickets
                  </NavLink>
                )}

                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationPanelOpen((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    🔔
                  </button>

                  {notificationPanelOpen && <NotificationPanel />}
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreferences(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  title="Notification Preferences"
                  aria-label="Notification Preferences"
                >
                  ⚙️
                </button>

                <div className="hidden items-center gap-1 rounded-xl border border-border bg-muted/50 p-1 md:inline-flex">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm transition-colors ${
                      theme === "light"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={theme === "light"}
                    title="Light mode"
                  >
                    ☀️
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm transition-colors ${
                      theme === "dark"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={theme === "dark"}
                    title="Dark mode"
                  >
                    🌙
                  </button>

                  {/* <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm transition-colors ${
                      theme === "system"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={theme === "system"}
                    title="System theme"
                  >
                    💻
                  </button> */}
                </div>

                <div className="max-w-[220px] truncate rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                  {auth?.email}
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-lg text-foreground transition-colors hover:bg-accent lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border/60 lg:hidden">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
              {!isAuthenticated && (
                <>
                  <NavLink to="/login" className={navLinkClasses}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className={navLinkClasses}>
                    Signup
                  </NavLink>
                </>
              )}

              {isAuthenticated && (
                <>
                  {/* <NavLink to="/home" className={navLinkClasses}>
                    Home
                  </NavLink> */}

                  {isAdmin && (
                    <div className="rounded-xl border border-border bg-card p-2">
                      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Admin
                      </p>
                      <div className="flex flex-col gap-1">
                        {adminLinks.map(({ to, label }) => (
                          <NavLink key={to} to={to} className={dropdownLinkClasses}>
                            {label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}

                  {isTechnician && (
                    <NavLink to="/check-in" className={navLinkClasses}>
                      Check-In
                    </NavLink>
                  )}

                  {is}
                  <NavLink to="/dashboard/student/bookings" className={navLinkClasses}>
                    My Bookings
                  </NavLink>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNotificationPanelOpen((prev) => !prev)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-lg"
                      aria-label="Notifications"
                    >
                      🔔
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPreferences(true)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-lg"
                      aria-label="Notification Preferences"
                    >
                      ⚙️
                    </button>

                    <button
                      type="button"
                      onClick={logout}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                    >
                      Logout
                    </button>
                  </div>

                  <div className="truncate rounded-xl border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    {auth?.email}
                  </div>

                  {notificationPanelOpen && (
                    <div className="relative mt-2">
                      <NotificationPanel />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {showPreferences && (
        <NotificationPreferences onClose={() => setShowPreferences(false)} />
      )}
    </>
  );
}