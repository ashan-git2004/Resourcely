import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, auth, logout } = useAuth();
  const isAdmin = (auth?.roles || []).includes("ADMIN");
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
                  </div>
                )}
              </div>
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
      `}</style>
    </header>
  );
}
