import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../features/notifications/NotificationBell";

export default function Navbar() {
  const { isAuthenticated, auth, logout } = useAuth();
  const isAdmin = (auth?.roles || []).includes("ADMIN");
  const isTechnician = (auth?.roles || []).includes("TECHNICIAN");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

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
              Sign up
            </NavLink>
          </>
        )}

        {isAuthenticated && (
          <>
            {isAdmin && (
              <div className="admin-menu">
                <button
                  type="button"
                  className="admin-menu-button"
                  onClick={() => setAdminMenuOpen((prev) => !prev)}
                >
                  Admin
                </button>
                {adminMenuOpen && (
                  <div className="admin-dropdown">
                    <NavLink
                      to="/admin/users"
                      className="dropdown-link"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Users
                    </NavLink>
                    <NavLink
                      to="/admin/resources"
                      className="dropdown-link"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      Resources
                    </NavLink>
                  </div>
                )}
              </div>
            )}

            {isTechnician && (
              <NavLink to="/dashboard/technician" className="nav-link">
                Technician Hub
              </NavLink>
            )}

            <NotificationBell />
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
