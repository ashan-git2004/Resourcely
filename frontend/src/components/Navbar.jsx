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
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
            <NavLink to="/register" className="nav-link">
              Signup
            </NavLink>
          </>
        )}

        {isAuthenticated && (
          <>
            {isAdmin && (
              <div className="admin-menu">
                <button
                  className="nav-link"
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                >
                  Admin ▼
                </button>
                {adminMenuOpen && (
                  <div className="admin-dropdown">
                    <NavLink to="/admin/users" className="dropdown-link" onClick={() => setAdminMenuOpen(false)}>
                      Users
                    </NavLink>
                    <NavLink to="/admin/resources" className="dropdown-link" onClick={() => setAdminMenuOpen(false)}>
                      Resources
                    </NavLink>
                    <NavLink to="/admin/bookings" className="dropdown-link" onClick={() => setAdminMenuOpen(false)}>
                      Bookings
                    </NavLink>
                    <NavLink to="/admin/tickets" className="dropdown-link" onClick={() => setAdminMenuOpen(false)}>
                      Tickets
                    </NavLink>
                  </div>
                )}
              </div>
            )}
            {isTechnician && (
              <NavLink to="/check-in" className="nav-link">
                Check-In
              </NavLink>
            )}
            <NavLink to="/dashboard/student/bookings" className="nav-link">
              My Bookings
            </NavLink>
            
            {/* Notification Bell */}
            <div className="notification-menu">
              <button 
                className="notification-bell"
                onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                title="Notifications"
              >
                🔔
              </button>
              {notificationPanelOpen && (
                <NotificationPanel />
              )}
            </div>

            {/* Preferences */}
            <button
              className="preferences-btn"
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

      <style>{`
        .admin-menu {
          position: relative;
        }

        .admin-menu > button {
          background: none;
          border: none;
          color: #0066cc;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.5rem;
          margin: 0;
        }

        .admin-menu > button:hover {
          color: #0052a3;
        }

        .admin-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          min-width: 150px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }

        .dropdown-link {
          display: block;
          padding: 0.75rem 1rem;
          color: #0066cc;
          text-decoration: none;
          border: none;
          background: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background-color 0.2s;
        }

        .dropdown-link:hover {
          background-color: #f0f0f0;
          color: #0052a3;
        }

        .dropdown-link:first-child {
          border-radius: 4px 4px 0 0;
        }

        .dropdown-link:last-child {
          border-radius: 0 0 4px 4px;
        }

        .notification-menu {
          position: relative;
          display: inline-block;
        }

        .notification-bell {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem 0.8rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .notification-bell:hover {
          background-color: #f0f0f0;
        }

        .preferences-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem 0.8rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .preferences-btn:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </header>
  );
}
