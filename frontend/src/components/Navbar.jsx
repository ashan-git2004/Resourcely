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
            {isAdmin && (
              <div className="relative">
                <button
                  className="bg-transparent border-none text-[#0066cc] cursor-pointer text-base px-2 py-2 hover:text-[#0052a3]"
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                >
                  Admin ▼
                </button>
                {adminMenuOpen && (
                  <div className="absolute top-full left-0 bg-white border border-[#e0e0e0] rounded min-w-[150px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] z-[100]">
                    {[
                      { to: "/admin/users",     label: "Users" },
                      { to: "/admin/resources", label: "Resources" },
                      { to: "/admin/bookings",  label: "Bookings" },
                      { to: "/admin/tickets",   label: "Tickets" },
                    ].map(({ to, label }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className="block px-4 py-3 text-[#0066cc] no-underline bg-transparent w-full text-left transition-colors hover:bg-[#f0f0f0] hover:text-[#0052a3]"
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
                className="bg-transparent border-none text-xl cursor-pointer px-3 py-2 rounded transition-colors hover:bg-[#f0f0f0]"
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
