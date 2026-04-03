import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../features/notifications/NotificationBell";

export default function Navbar() {
  const { isAuthenticated, auth, logout } = useAuth();
  const isAdmin = (auth?.roles || []).includes("ADMIN");

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
              <NavLink to="/admin/users" className="nav-link">
                Admin
              </NavLink>
            )}
            <NavLink to="/technician/tickets" className="nav-link">My Tickets</NavLink>
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
