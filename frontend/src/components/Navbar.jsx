import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationPanel from "../features/notifications/NotificationPanel";
import NotificationPreferences from "../features/notifications/NotificationPreferences";

export default function Navbar() {
  const { isAuthenticated, auth, logout } = useAuth();
  const isAdmin = (auth?.roles || []).includes("ADMIN");
  const isTechnician = (auth?.roles || []).includes("TECHNICIAN");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Smart Campus
      </Link>

      <nav className="topnav">
        {!isAuthenticated && (
          <>
            <NavLink to="/login" className="nav-link">Login</NavLink>
            <NavLink to="/register" className="nav-link">Signup</NavLink>
          </>
        )}

        {isAuthenticated && (
          <>
            <NavLink to="/home" className="nav-link font-semibold">
              Home
            </NavLink>

            {isAdmin && (
              <div className="relative">
                <button
                  className="nav-link bg-transparent border-none cursor-pointer flex items-center gap-1 px-2 py-2"
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                >
                  Admin <span className="text-xs">▼</span>
                </button>
                {adminMenuOpen && (
                  <div className="absolute top-full right-0 bg-campus-panel border border-campus-border rounded-xl min-w-[160px] shadow-lg z-[100] overflow-hidden">
                    {[
                      { to: "/admin/users",     label: "Users" },
                      { to: "/admin/resources", label: "Resources" },
                      { to: "/admin/bookings",  label: "Bookings" },
                      { to: "/admin/tickets",   label: "Tickets" },
                    ].map(({ to, label }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className="block px-4 py-2.5 text-campus-ink no-underline bg-transparent w-full text-left transition-colors hover:bg-campus-accent/10 hover:text-campus-accent"
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
              <NavLink to="/check-in" className="nav-link">Check-In</NavLink>
            )}

            <NavLink to="/dashboard/student/bookings" className="nav-link">
              My Bookings
            </NavLink>

            <div className="relative inline-block">
              <button
                className="bg-transparent border-none text-xl cursor-pointer px-3 py-2 rounded transition-colors hover:bg-campus-accent/10"
                onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                title="Notifications"
              >
                🔔
              </button>
              {notificationPanelOpen && <NotificationPanel />}
            </div>

            <button
              className="bg-transparent border-none text-xl cursor-pointer px-3 py-2 rounded transition-colors hover:bg-[#f0f0f0]"
              onClick={() => setShowPreferences(true)}
              title="Notification Preferences"
            >
              ⚙️
            </button>

            {showPreferences && (
              <NotificationPreferences onClose={() => setShowPreferences(false)} />
            )}

            <span className="user-pill">{auth?.email}</span>
            <button type="button" className="ghost-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
